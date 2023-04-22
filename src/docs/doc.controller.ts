import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContentsService } from 'src/contents/contents.service';
import { Content } from 'src/contents/schemas/contents.schema';
import { RelationsService } from 'src/relations/relations.service';
import { Relation } from 'src/relations/schemas/relations.schema';
import { UsersService } from 'src/users/users.service';
import { gitHashObject } from 'src/utils/gitHashObject';
import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { Doc } from './schemas/docs.schema';
import validatePathPermission from './utils/validatePathPermission';

interface IViewerContents {
  [key: string]: string;
}
interface IViewerRelation {
  id: string;
  fromRange: [number, number];
  toRange: [number, number];
}

@Controller('api/doc')
export class DocController {
  constructor(
    private readonly docsService: DocsService,
    private readonly contentsService: ContentsService,
    private readonly relationService: RelationsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createDocDto: CreateDocDto) {
    const {
      originalContent,
      translatedContent,
      originalFromContent,
      path: docPath,
    } = createDocDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await validatePathPermission({
      usersService: this.usersService,
      path: docPath,
      userObjectId,
    });

    // check if doc exists
    const docCheckResult = await this.docsService.findOne({
      path: docPath,
    });

    if (docCheckResult) {
      throw new HttpException(
        `Doc path ${docPath} already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const { getRelationRanges } = await import('relation2-core');

    const doc = new Doc();

    const originalContentSha = await gitHashObject(originalContent);
    const translatedContentSha = await gitHashObject(translatedContent);
    const originalFromContentSha = await gitHashObject(originalFromContent);

    doc.createUserObjectId = userObjectId;
    doc.path = docPath;
    doc.depth = createDocDto.path.split('/').length - 1;
    doc.originalOwner = createDocDto.originalOwner;
    doc.originalRepo = createDocDto.originalRepo;
    doc.originalBranch = createDocDto.originalBranch;
    doc.originalPath = createDocDto.originalPath;
    doc.originalRev = createDocDto.originalRev;
    doc.originalContentSha = originalContentSha;
    doc.translatedOwner = createDocDto.translatedOwner;
    doc.translatedRepo = createDocDto.translatedRepo;
    doc.translatedBranch = createDocDto.translatedBranch;
    doc.translatedPath = createDocDto.translatedPath;
    doc.translatedRev = createDocDto.translatedRev;
    doc.translatedContentSha = translatedContentSha;

    const originalContentInstance = new Content();
    originalContentInstance.sha = originalContentSha;
    originalContentInstance.content = originalContent;
    await this.contentsService.createIfNotExist(originalContentInstance);

    const translatedContentInstance = new Content();
    translatedContentInstance.sha = translatedContentSha;
    translatedContentInstance.content = translatedContent;
    await this.contentsService.createIfNotExist(translatedContentInstance);

    const originalFromContentInstance = new Content();
    originalFromContentInstance.sha = originalFromContentSha;
    originalFromContentInstance.content = originalFromContent;
    await this.contentsService.createIfNotExist(originalFromContentInstance);

    const createdDoc = await this.docsService.create(doc);

    const ranges = await getRelationRanges(
      originalFromContent,
      translatedContent,
    );

    const relations = ranges.map((range) => {
      const relation = new Relation();
      relation.docObjectId = createdDoc._id;
      relation.fromRange = range.fromRange;
      relation.toRange = range.toRange;
      relation.fromContentSha = originalFromContentSha;
      relation.toContentSha = translatedContentSha;
      return relation;
    });

    await this.relationService.createMany(relations);

    return {
      path: doc.path,
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() docDto: CreateDocDto) {
    const { path: docPath } = docDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await validatePathPermission({
      usersService: this.usersService,
      path: docPath,
      userObjectId,
    });

    const doc = await this.docsService.findOne({
      path: docDto.path,
    });

    doc.updateUserObjectId = new Types.ObjectId(req.user.userId);

    if (docDto.translatedContent !== undefined) {
      const translatedContentSha = await gitHashObject(
        docDto.translatedContent,
      );

      const translatedContentInstance = new Content();
      translatedContentInstance.sha = translatedContentSha;
      translatedContentInstance.content = docDto.translatedContent;
      await this.contentsService.createIfNotExist(translatedContentInstance);

      doc.translatedContentSha = translatedContentSha;
    }

    await doc.save();

    return doc;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async delete(
    @Req() req,
    @Query('path') docPath: string,
    @Query('permanently') permanently: string,
  ) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    await validatePathPermission({
      usersService: this.usersService,
      path: docPath,
      userObjectId,
    });

    const deleteDoc = await this.docsService.findOne({
      path: docPath,
    });

    if (permanently === 'true') {
      await deleteDoc.deleteOne();
      return true;
    }

    deleteDoc.isDelete = true;
    deleteDoc.deleteUserObjectId = userObjectId;
    deleteDoc.deleteDate = new Date();

    await deleteDoc.save();

    return true;
  }

  @Get('viewer-data')
  async getViewerData(@Query('path') docPath: string) {
    const doc = await this.docsService.findOne({
      path: docPath,
    });

    const fromModified = await this.contentsService.findOne({
      sha: doc.originalContentSha,
    });

    const toModified = await this.contentsService.findOne({
      sha: doc.translatedContentSha,
    });

    const relations = await this.relationService.find({
      docObjectId: doc._id,
    });

    const viewerRelations: IViewerRelation[] = [];

    const viewerContents: IViewerContents = {};

    // TODO: update to use fromOriginalContentSha and toOriginalContentSha
    const fromOriginal = await this.contentsService.findOne({
      sha: relations[0].fromContentSha,
    });
    const toOriginal = await this.contentsService.findOne({
      sha: relations[0].toContentSha,
    });

    for (const relation of relations) {
      viewerRelations.push({
        id: relation._id.toString(),
        fromRange: relation.fromRange,
        toRange: relation.toRange,
      });
    }

    return {
      docObjectId: doc._id.toString(),
      fromPath: doc.originalPath,
      toPath: doc.translatedPath,
      fromOriginalContent: fromOriginal.content,
      fromOriginalContentSha: fromOriginal.sha,
      fromModifiedContent: fromModified.content,
      fromModifiedContentSha: fromModified.sha,
      toOriginalContent: toOriginal.content,
      toOriginalContentSha: toOriginal.sha,
      toModifiedContent: toModified.content,
      toModifiedContentSha: toModified.sha,
      translatedOwner: doc.translatedOwner,
      translatedRepo: doc.translatedRepo,
      translatedBranch: doc.translatedBranch,
      translatedRev: doc.translatedRev,
      relations: viewerRelations,
      viewerContents,
    };
  }
}
