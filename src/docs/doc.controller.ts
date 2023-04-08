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

interface IViewerContents {
  [key: string]: string;
}
interface IViewerRelation {
  id: string;
  fromRange: [number, number];
  toRange: [number, number];
  originalFromViewerContentRev: string;
  originalToViewerContentRev: string;
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

    await this.validatePathPermission({
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

    await this.docsService.create(doc);

    const ranges = await getRelationRanges(
      originalFromContent,
      translatedContent,
    );

    const relations = ranges.map((range) => {
      const relation = new Relation();
      relation.docPath = docPath;
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

    await this.validatePathPermission({
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

    doc.save();

    return doc;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Body() docDto: CreateDocDto) {
    const { path: docPath } = docDto;
    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.validatePathPermission({
      path: docPath,
      userObjectId,
    });

    // TODO: implement
  }

  @Get('viewer-data')
  async getViewerData(@Query('path') docPath: string) {
    const doc = await this.docsService.findOne({
      path: docPath,
    });

    const originalContent = await this.contentsService.findOne({
      sha: doc.originalContentSha,
    });

    const translatedContent = await this.contentsService.findOne({
      sha: doc.translatedContentSha,
    });

    const relations = await this.relationService.find({
      docPath,
    });

    const viewerRelations: IViewerRelation[] = [];

    const viewerContents: IViewerContents = {};

    // TODO: optimize
    for (const relation of relations) {
      if (!viewerContents[relation.fromContentSha]) {
        viewerContents[relation.fromContentSha] = (
          await this.contentsService.findOne({
            sha: relation.fromContentSha,
          })
        ).content;
      }

      if (!viewerContents[relation.toContentSha]) {
        viewerContents[relation.toContentSha] = (
          await this.contentsService.findOne({
            sha: relation.toContentSha,
          })
        ).content;
      }

      viewerRelations.push({
        id: relation._id.toString(),
        fromRange: relation.fromRange,
        toRange: relation.toRange,
        originalFromViewerContentRev: relation.fromContentSha,
        originalToViewerContentRev: relation.toContentSha,
      });
    }

    return {
      fromPath: doc.originalPath,
      toPath: doc.translatedPath,
      fromModifiedContent: originalContent.content,
      toModifiedContent: translatedContent.content,
      translatedOwner: doc.translatedOwner,
      translatedRepo: doc.translatedRepo,
      translatedBranch: doc.translatedBranch,
      translatedRev: doc.translatedRev,
      viewerRelations,
      viewerContents,
    };
  }

  async validatePathPermission({
    path,
    userObjectId,
  }: {
    path: string;
    userObjectId: Types.ObjectId;
  }) {
    const user = await this.usersService.findById(userObjectId);
    const { login, pathPermissions } = user;

    if (path.startsWith(`/${login}/`)) {
      return true;
    }

    if (pathPermissions?.some((p) => path.startsWith(p))) {
      return true;
    }

    throw new HttpException(
      `${login} doesn't have permissions for ${path}.`,
      HttpStatus.FORBIDDEN,
    );
  }
}
