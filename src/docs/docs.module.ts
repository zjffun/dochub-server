import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentsModule } from 'src/contents/contents.module';
import { UsersModule } from 'src/users/users.module';
import { DocRelationController } from './doc-relation.controller';
import { DocController } from './doc.controller';
import { DocsController } from './docs.controller';
import { DocsService } from './docs.service';
import { ProjectController } from './project.controller';
import { Doc, DocSchema } from './schemas/docs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Doc.name, schema: DocSchema }]),
    ContentsModule,
    UsersModule,
  ],
  controllers: [
    DocsController,
    DocController,
    DocRelationController,
    ProjectController,
  ],
  providers: [DocsService],
  exports: [DocsService],
})
export class DocsModule {}
