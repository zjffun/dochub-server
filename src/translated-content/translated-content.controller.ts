import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTranslatedContentDto } from './dto/create-translated-content.dto';
import { TranslatedContent } from './schemas/translated-content.schema';
import { TranslatedContentService } from './translated-content.service';

@Controller('api/translated-content')
export class TranslatedContentController {
  constructor(
    private readonly translatedContentService: TranslatedContentService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body()
    createTranslatedContentDto: CreateTranslatedContentDto,
  ) {
    const { pick } = await import('lodash-es');
    const { nanoid } = await import('nanoid');

    const translatedContent = new TranslatedContent();
    translatedContent.userObjectId = new Types.ObjectId(req.user.userId);
    translatedContent.fromPath = createTranslatedContentDto.fromPath;
    translatedContent.toPath = createTranslatedContentDto.toPath;
    translatedContent.nameId = createTranslatedContentDto.nameId;
    translatedContent.content = createTranslatedContentDto.content;

    translatedContent.title = createTranslatedContentDto.title;
    if (typeof translatedContent.title !== 'string') {
      translatedContent.title = nanoid();
    }

    const res = await this.translatedContentService.createOrUpdate(
      translatedContent,
    );
    const pickedRes = pick(res, ['title']);

    return pickedRes;
  }
}
