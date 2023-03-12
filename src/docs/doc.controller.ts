import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContentsService } from 'src/contents/contents.service';
import { Content } from 'src/contents/schemas/contents.schema';
import { gitHashObject } from 'src/utils/gitHashObject';
import { DocsService } from './docs.service';
import { CreateCollectionDto } from './dto/create-doc.dto';
import { Doc } from './schemas/docs.schema';

@Controller('api/doc')
export class DocController {
  constructor(
    private readonly docsService: DocsService,
    private readonly contentsService: ContentsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createRelationDto: CreateCollectionDto) {
    const doc = new Doc();

    const originalContentSha = await gitHashObject(
      createRelationDto.originalContent,
    );
    const translatedContentSha = await gitHashObject(
      createRelationDto.translatedContent,
    );

    doc.createUserObjectId = new Types.ObjectId(req.user.userId);
    doc.path = createRelationDto.path;
    doc.depth = createRelationDto.path.split('/').length - 1;
    doc.originalOwner = createRelationDto.originalOwner;
    doc.originalRepo = createRelationDto.originalRepo;
    doc.originalBranch = createRelationDto.originalBranch;
    doc.originalPath = createRelationDto.originalPath;
    doc.originalContentSha = originalContentSha;
    doc.translatedOwner = createRelationDto.translatedOwner;
    doc.translatedRepo = createRelationDto.translatedRepo;
    doc.translatedBranch = createRelationDto.translatedBranch;
    doc.translatedPath = createRelationDto.translatedPath;
    doc.translatedContentSha = translatedContentSha;

    const originalContent = new Content();
    originalContent.sha = originalContentSha;
    originalContent.content = createRelationDto.originalContent;
    await this.contentsService.createIfNotExist(originalContent);

    const translatedContent = new Content();
    translatedContent.sha = translatedContentSha;
    translatedContent.content = createRelationDto.translatedContent;
    await this.contentsService.createIfNotExist(translatedContent);

    await this.docsService.create(doc);

    return true;
  }

  @Get('viewer-data')
  async getRelationViewerData(@Query('path') docPath: string) {
    // TODO: implement
    return false;
  }
}
