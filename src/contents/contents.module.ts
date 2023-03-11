import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentsController } from './contents.controller';
import { ContentsService } from './contents.service';
import { Content, ContentsSchema } from './schemas/contents.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Content.name, schema: ContentsSchema }]),
  ],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}
