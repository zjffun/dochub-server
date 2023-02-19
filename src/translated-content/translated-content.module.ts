import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TranslatedContent,
  TranslatedContentSchema,
} from './schemas/translated-content.schema';
import { TranslatedContentController } from './translated-content.controller';
import { TranslatedContentService } from './translated-content.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TranslatedContent.name, schema: TranslatedContentSchema },
    ]),
  ],
  controllers: [TranslatedContentController],
  providers: [TranslatedContentService],
  exports: [TranslatedContentService],
})
export class TranslatedContentModule {}
