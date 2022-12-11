import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';
import { Relation, RelationSchema } from './schemas/relations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Relation.name, schema: RelationSchema },
    ]),
  ],
  controllers: [RelationsController],
  providers: [RelationsService],
})
export class RelationsModule {}
