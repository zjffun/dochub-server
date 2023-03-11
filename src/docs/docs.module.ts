import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentsModule } from 'src/contents/contents.module';
import { RelationsModule } from 'src/relations/relations.module';
import { DocController } from './doc.controller';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { Doc, DocSchema } from './schemas/docs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doc.name, schema: DocSchema }]),
    RelationsModule,
    ContentsModule,
  ],
  controllers: [DocsController, DocController],
  providers: [DocsService],
})
export class DocsModule {}
