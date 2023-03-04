import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TranslatedContentModule } from 'src/translated-content/translated-content.module';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';
import { Relation, RelationSchema } from './schemas/relations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Relation.name, schema: RelationSchema },
    ]),
    TranslatedContentModule,
  ],
  controllers: [RelationsController],
  providers: [RelationsService],
  exports: [RelationsService],
})
export class RelationsModule {}
