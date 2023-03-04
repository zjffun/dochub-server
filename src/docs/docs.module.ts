import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationsModule } from 'src/relations/relations.module';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { Doc, DocSchema } from './schemas/docs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doc.name, schema: DocSchema }]),
    RelationsModule,
  ],
  controllers: [DocsController],
  providers: [DocsService],
})
export class DocsModule {}
