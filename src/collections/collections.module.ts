import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationsModule } from 'src/relations/relations.module';
import { RelationsService } from 'src/relations/relations.service';
import { CollectionsController } from './collections.controller';
import { CollectionsService } from './collections.service';
import { Collection, CollectionSchema } from './schemas/collections.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Collection.name, schema: CollectionSchema },
    ]),
    RelationsModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
})
export class CollectionsModule {}
