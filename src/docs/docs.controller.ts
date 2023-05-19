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
import { JwtStrategy } from 'src/auth/jwt.strategy';
import { apiPrefix } from 'src/config';
import { ContentsService } from 'src/contents/contents.service';
import { Content } from 'src/contents/schemas/contents.schema';
import { UsersService } from 'src/users/users.service';
import { gitHashObject } from 'src/utils/gitHashObject';
import { getPageInfo } from 'src/utils/page';
import { DocsService } from './docs.service';
import { IDocDto } from './dto/doc.dto';
import { Doc } from './schemas/docs.schema';
import getDocRes from './utils/getDocRes';
import Relation from './utils/Relation';
import setUpdateData from './utils/setUpdateData';

@Controller(apiPrefix)
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly contentsService: ContentsService,
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Get('v1/docs')
  async getDocs(
    @Req() req,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('path') path: string,
    @Query('depth') depthQuery: string,
    @Query('isDelete') isDeleteQuery: string,
  ) {
    const pageInfo = getPageInfo(page, pageSize);
    const depth = Number(depthQuery);
    const isDelete = isDeleteQuery === 'true';

    if (isDelete) {
      const jwtStrategy = new JwtStrategy();
      const user = await jwtStrategy.getUser(req);
      const userObjectId = new Types.ObjectId(user.userId);

      await this.usersService.validatePathWritePermission({
        path,
        userId: userObjectId,
      });
    }

    const list = await this.docsService.findAll({
      ...pageInfo,
      path,
      depth,
      isDelete,
    });

    const total = await this.docsService.count({
      path,
      depth,
      isDelete,
    });

    const result = {
      list,
      total,
    };

    return result;
  }

  @Get('v1/doc')
  async getDoc(@Query('path') docPath: string) {
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
      toEditingContent: toEditingContent?.content,
    });
  }

  @Post('v1/doc')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createDocDto: IDocDto) {
    const {
      fromOriginalContent,
      fromModifiedContent,
      toOriginalContent,
      path: docPath,
    } = createDocDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: docPath,
      userId: userObjectId,
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

    const relations = createDocDto.relations.map((d) => {
      const relation = new Relation({
        fromRange: d.fromRange,
        toRange: d.toRange,
      });
      return relation;
    });

    doc.relations = relations;

    await this.docsService.create(doc);

    return {
      path: doc.path,
    };
  }

  @Post('v1/docs')
  @UseGuards(JwtAuthGuard)
  async batchCreate(
    @Req() req,
    @Body()
    batchCreateDocsDto: IDocDto & {
      fromGlobs: string;
      toGlobs: string;
    },
  ) {
    const { path: docPath } = batchCreateDocsDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: docPath,
      userId: userObjectId,
    });

    // TODO: implement batch create

    return {};
  }

  @Post('v1/fork-doc')
  @UseGuards(JwtAuthGuard)
  async forkDoc(
    @Req() req,
    @Body()
    forkDocDto: IDocDto & {
      forkedDocId: string;
    },
  ) {
    const { forkedDocId, path: docPath } = forkDocDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: docPath,
      userId: userObjectId,
    });

    // check if doc exists
    const docCheckResult = await this.docsService.findOne({
      path: docPath,
    });

    if (docCheckResult) {
      return {
        path: docCheckResult.path,
      };
    }

    const formDoc = await this.docsService.findOne({
      _id: new Types.ObjectId(forkedDocId),
    });

    const doc = new Doc();

    doc.createUserObjectId = userObjectId;
    doc.path = docPath;
    doc.depth = docPath.split('/').length - 1;
    doc.fromOwner = formDoc.fromOwner;
    doc.fromRepo = formDoc.fromRepo;
    doc.fromBranch = formDoc.fromBranch;
    doc.fromPath = formDoc.fromPath;
    doc.fromOriginalRev = formDoc.fromOriginalRev;
    doc.fromModifiedRev = formDoc.fromModifiedRev;
    doc.fromOriginalContentSha = formDoc.fromOriginalContentSha;
    doc.fromModifiedContentSha = formDoc.fromModifiedContentSha;
    doc.toOwner = formDoc.toOwner;
    doc.toRepo = formDoc.toRepo;
    doc.toBranch = formDoc.toBranch;
    doc.toPath = formDoc.toPath;
    doc.toOriginalRev = formDoc.toOriginalRev;
    doc.toModifiedRev = formDoc.toOriginalRev;
    doc.toOriginalContentSha = formDoc.toOriginalContentSha;
    doc.toModifiedContentSha = formDoc.toOriginalContentSha;
    doc.relations = formDoc.relations;

    await this.docsService.create(doc);

    return {
      path: doc.path,
    };
  }

  @Put('v1/doc')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() docDto: IDocDto) {
    const { path: docPath } = docDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: docPath,
      userId: userObjectId,
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

  @Delete('v1/doc')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Req() req,
    @Body() deleteDocDto: IDocDto & { permanently: boolean },
  ) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: deleteDocDto.path,
      userId: userObjectId,
    });

    const deleteDoc = await this.docsService.findOne({
      path: deleteDocDto.path,
    });

    if (deleteDocDto.permanently === true) {
      await deleteDoc.deleteOne();
      return true;
    }

    deleteDoc.isDelete = true;
    deleteDoc.deleteUserObjectId = userObjectId;
    deleteDoc.deleteDate = new Date();

    await deleteDoc.save();

    return true;
  }
}
