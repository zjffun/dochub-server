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
import { RelationsService } from 'src/relations/relations.service';
import { Relation } from 'src/relations/schemas/relations.schema';
import { UsersService } from 'src/users/users.service';
import { gitHashObject } from 'src/utils/gitHashObject';
import getRelationRanges from 'src/utils/mdx/getRelationRanges';
import { DocsService } from './docs.service';
import { CreateDocDto } from './dto/create-doc.dto';
import { UpdateDocDto } from './dto/update-doc.dto';
import { Doc } from './schemas/docs.schema';
import validatePathPermission from './utils/validatePathPermission';

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
    @InjectConnection() private readonly connection: mongoose.Connection,
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
  async update(@Req() req, @Body() docDto: UpdateDocDto) {
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

    UpdateDocDto.setUpdateData(doc, docDto);

    const session = await this.connection.startSession();

    await session.withTransaction(async () => {
      await doc.save({
        session,
      });

      if (docDto.relations) {
        for (const relation of docDto.relations) {
          const relationDoc = await this.relationService.findOne(relation.id);

          if (relationDoc.docObjectId.toString() === doc.id) {
            relationDoc.fromRange = relation.fromRange;
            relationDoc.toRange = relation.toRange;

            await relationDoc.save({
              session,
            });
          }
        }
      }
    });

    session.endSession();

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

    for (const relation of relations) {
      viewerRelations.push({
        id: relation.id,
        fromRange: relation.fromRange,
        toRange: relation.toRange,
      });
    }

    return {
      docObjectId: doc.id,

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
