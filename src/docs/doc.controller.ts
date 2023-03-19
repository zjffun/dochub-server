import {
  Body,
  Controller,
  Delete,
  Get,
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
import { gitHashObject } from 'src/utils/gitHashObject';
import { DocsService } from './docs.service';
import { CreateCollectionDto } from './dto/create-doc.dto';
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
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createRelationDto: CreateCollectionDto) {
    const { getRelationRanges } = await import('relation2-core');

    const doc = new Doc();

    const { originalContent, translatedContent } = createRelationDto;
    const originalContentSha = await gitHashObject(originalContent);
    const translatedContentSha = await gitHashObject(translatedContent);

    doc.createUserObjectId = new Types.ObjectId(req.user.userId);
    doc.path = createRelationDto.path;
    doc.depth = createRelationDto.path.split('/').length - 1;
    doc.originalOwner = createRelationDto.originalOwner;
    doc.originalRepo = createRelationDto.originalRepo;
    doc.originalBranch = createRelationDto.originalBranch;
    doc.originalPath = createRelationDto.originalPath;
    doc.originalRev = createRelationDto.originalRev;
    doc.originalContentSha = originalContentSha;
    doc.translatedOwner = createRelationDto.translatedOwner;
    doc.translatedRepo = createRelationDto.translatedRepo;
    doc.translatedBranch = createRelationDto.translatedBranch;
    doc.translatedPath = createRelationDto.translatedPath;
    doc.translatedRev = createRelationDto.translatedRev;
    doc.translatedContentSha = translatedContentSha;

    const originalContentInstance = new Content();
    originalContentInstance.sha = originalContentSha;
    originalContentInstance.content = originalContent;
    await this.contentsService.createIfNotExist(originalContentInstance);

    const translatedContentInstance = new Content();
    translatedContentInstance.sha = translatedContentSha;
    translatedContentInstance.content = translatedContent;
    await this.contentsService.createIfNotExist(translatedContentInstance);

    await this.docsService.create(doc);

    const ranges = await getRelationRanges(originalContent, translatedContent);

    const relations = ranges.map((range) => {
      const relation = new Relation();
      relation.docPath = createRelationDto.path;
      relation.fromRange = range.fromRange;
      relation.toRange = range.toRange;
      relation.fromContentSha = originalContentSha;
      relation.toContentSha = translatedContentSha;
      return relation;
    });

    await this.relationService.createMany(relations);

    return true;
  }

  @Put()
  @UseGuards(JwtAuthGuard)
  async update(@Req() req, @Body() relationDto: CreateCollectionDto) {
    const doc = await this.docsService.findOne({
      path: relationDto.path,
    });

    doc.updateUserObjectId = new Types.ObjectId(req.user.userId);

    if (relationDto.translatedContent !== undefined) {
      const translatedContentSha = await gitHashObject(
        relationDto.translatedContent,
      );

      const translatedContentInstance = new Content();
      translatedContentInstance.sha = translatedContentSha;
      translatedContentInstance.content = relationDto.translatedContent;
      await this.contentsService.createIfNotExist(translatedContentInstance);

      doc.translatedContentSha = translatedContentSha;
    }

    doc.save();

    return doc;
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  async delete() {
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
}
