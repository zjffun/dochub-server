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
import getRelationRanges from 'src/utils/mdx/getRelationRanges';
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
      fromOriginalContent,
      fromModifiedContent,
      toOriginalContent,
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

    const doc = new Doc();

    const fromOriginalContentSha = await gitHashObject(fromOriginalContent);
    const fromModifiedContentSha = await gitHashObject(fromModifiedContent);
    const toOriginalContentSha = await gitHashObject(toOriginalContent);

    doc.createUserObjectId = userObjectId;
    doc.path = docPath;
    doc.depth = createDocDto.path.split('/').length - 1;
    doc.fromOwner = createDocDto.fromOwner;
    doc.fromRepo = createDocDto.fromRepo;
    doc.fromBranch = createDocDto.fromBranch;
    doc.fromPath = createDocDto.fromPath;
    doc.fromOriginalRev = createDocDto.fromOriginalRev;
    doc.fromModifiedRev = createDocDto.fromModifiedRev;
    doc.fromOriginalContentSha = fromOriginalContentSha;
    doc.fromModifiedContentSha = fromModifiedContentSha;
    doc.toOwner = createDocDto.toOwner;
    doc.toRepo = createDocDto.toRepo;
    doc.toBranch = createDocDto.toBranch;
    doc.toPath = createDocDto.toPath;
    doc.toOriginalRev = createDocDto.toOriginalRev;
    doc.toModifiedRev = createDocDto.toOriginalRev;
    doc.toOriginalContentSha = toOriginalContentSha;
    doc.toModifiedContentSha = toOriginalContentSha;
    doc.pullNumber = createDocDto.pullNumber;

    const fromOriginalContentInstance = new Content();
    fromOriginalContentInstance.sha = fromOriginalContentSha;
    fromOriginalContentInstance.content = fromOriginalContent;
    await this.contentsService.createIfNotExist(fromOriginalContentInstance);

    const fromModifiedContentInstance = new Content();
    fromModifiedContentInstance.sha = fromModifiedContentSha;
    fromModifiedContentInstance.content = fromModifiedContent;
    await this.contentsService.createIfNotExist(fromModifiedContentInstance);

    const toContentInstance = new Content();
    toContentInstance.sha = toOriginalContentSha;
    toContentInstance.content = toOriginalContent;
    await this.contentsService.createIfNotExist(toContentInstance);

    const createdDoc = await this.docsService.create(doc);

    const ranges = await getRelationRanges(
      fromOriginalContent,
      toOriginalContent,
    );

    const relations = ranges.map((range) => {
      const relation = new Relation();
      relation.docObjectId = createdDoc._id;
      relation.fromRange = range.fromRange;
      relation.toRange = range.toRange;
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

    if (docDto.toModifiedContent !== undefined) {
      const toModifiedContentSha = await gitHashObject(
        docDto.toModifiedContent,
      );

      const toContentInstance = new Content();
      toContentInstance.sha = toModifiedContentSha;
      toContentInstance.content = docDto.toModifiedContent;
      await this.contentsService.createIfNotExist(toContentInstance);

      doc.toModifiedContentSha = toModifiedContentSha;

      if (!docDto.toModifiedRev) {
        doc.toModifiedRev = '';
      }
    }

    if (docDto.pullNumber !== undefined) {
      if (typeof docDto.pullNumber !== 'number') {
        throw new HttpException('pullNumber must be a number', 400);
      }

      doc.pullNumber = docDto.pullNumber;
    }

    if (docDto.toModifiedRev !== undefined) {
      doc.toModifiedRev = docDto.toModifiedRev;
    }

    // TODO: update translate

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

    const fromOriginalContent = await this.contentsService.findOne({
      sha: doc.fromOriginalContentSha,
    });

    const fromModifiedContent = await this.contentsService.findOne({
      sha: doc.fromModifiedContentSha,
    });

    const toOriginalContent = await this.contentsService.findOne({
      sha: doc.toOriginalContentSha,
    });

    const toModifiedContent = await this.contentsService.findOne({
      sha: doc.toModifiedContentSha,
    });

    const relations = await this.relationService.find({
      docObjectId: doc._id,
    });

    const viewerRelations: IViewerRelation[] = [];

    const viewerContents: IViewerContents = {};

    for (const relation of relations) {
      viewerRelations.push({
        id: relation._id.toString(),
        fromRange: relation.fromRange,
        toRange: relation.toRange,
      });
    }

    return {
      docObjectId: doc._id.toString(),

      fromOriginalContent: fromOriginalContent.content,
      fromOriginalContentSha: fromOriginalContent.sha,
      fromModifiedContent: fromModifiedContent.content,
      fromModifiedContentSha: fromModifiedContent.sha,
      toOriginalContent: toOriginalContent.content,
      toOriginalContentSha: toOriginalContent.sha,
      toModifiedContent: toModifiedContent.content,
      toModifiedContentSha: toModifiedContent.sha,

      fromOwner: doc.fromOwner,
      fromRepo: doc.fromRepo,
      fromBranch: doc.fromBranch,
      fromPath: doc.fromPath,

      toOwner: doc.toOwner,
      toRepo: doc.toRepo,
      toBranch: doc.toBranch,
      toPath: doc.toPath,

      fromOriginalRev: doc.fromOriginalRev,
      fromModifiedRev: doc.fromModifiedRev,
      toOriginalRev: doc.toOriginalRev,
      toModifiedRev: doc.toModifiedRev,
      pullNumber: doc.pullNumber,

      relations: viewerRelations,
    };
  }
}
