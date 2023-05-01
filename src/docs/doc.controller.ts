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
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContentsService } from 'src/contents/contents.service';
import { Content } from 'src/contents/schemas/contents.schema';
import { UsersService } from 'src/users/users.service';
import { gitHashObject } from 'src/utils/gitHashObject';
import getRelationRanges from 'src/utils/mdx/getRelationRanges';
import { DocsService } from './docs.service';
import { IDocDto } from './dto/doc.dto';
import { Doc } from './schemas/docs.schema';
import getDocRes from './utils/getDocRes';
import Relation from './utils/Relation';
import setUpdateData from './utils/setUpdateData';
import validatePathPermission from './utils/validatePathPermission';
@Controller('api/doc')
export class DocController {
  constructor(
    private readonly docsService: DocsService,
    private readonly contentsService: ContentsService,
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createDocDto: IDocDto) {
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

    const ranges = await getRelationRanges(
      fromOriginalContent,
      toOriginalContent,
    );

    const relations = ranges.map((range) => {
      const relation = new Relation({
        fromRange: range.fromRange,
        toRange: range.toRange,
      });
      return relation;
    });

    doc.relations = relations;

    await this.docsService.create(doc);

    return {
      path: doc.path,
    };
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() docDto: IDocDto) {
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

    if (docDto.fromOriginalContent !== undefined) {
      const contentDoc = await this.contentsService.createByContent(
        docDto.fromOriginalContent,
      );

      doc.fromOriginalContentSha = contentDoc.sha;
    }

    if (docDto.fromModifiedContent !== undefined) {
      const contentDoc = await this.contentsService.createByContent(
        docDto.fromModifiedContent,
      );

      doc.fromModifiedContentSha = contentDoc.sha;
    }

    if (docDto.toOriginalContent !== undefined) {
      const contentDoc = await this.contentsService.createByContent(
        docDto.toOriginalContent,
      );

      doc.toOriginalContentSha = contentDoc.sha;
    }

    if (docDto.toModifiedContent !== undefined) {
      const contentDoc = await this.contentsService.createByContent(
        docDto.toModifiedContent,
      );

      doc.toModifiedContentSha = contentDoc.sha;
    }

    if (docDto.toEditingContent !== undefined) {
      const contentDoc = await this.contentsService.createByContent(
        docDto.toEditingContent,
      );

      doc.toEditingContentSha = contentDoc.sha;
    }

    setUpdateData(doc, docDto);

    if (docDto.relations) {
      const relations = docDto.relations.map((d) => {
        const relation = new Relation({
          _id: new Types.ObjectId(d.id),
          fromRange: d.fromRange,
          toRange: d.toRange,
        });
        return relation;
      });
      doc.relations = relations;
    }

    await doc.save();

    return getDocRes(doc);
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

    const toEditingContent = await this.contentsService.findOne({
      sha: doc.toEditingContentSha,
    });

    return getDocRes(doc, {
      fromOriginalContent: fromOriginalContent.content,
      fromModifiedContent: fromModifiedContent.content,
      toOriginalContent: toOriginalContent.content,
      toModifiedContent: toModifiedContent.content,
      toEditingContent: toEditingContent.content,
    });
  }
}
