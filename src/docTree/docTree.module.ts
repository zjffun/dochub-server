import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocTreeController } from './docTree.controller';
import { DocTreeService } from './docTree.service';
import { DocTree, DocTreeSchema } from './schemas/docTree.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DocTree.name, schema: DocTreeSchema }]),
  ],
  controllers: [DocTreeController],
  providers: [DocTreeService],
  exports: [DocTreeService],
})
export class DocTreeModule {}
