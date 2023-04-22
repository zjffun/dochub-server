import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContentsModule } from 'src/contents/contents.module';
import { DocsModule } from 'src/docs/docs.module';
import { UsersModule } from 'src/users/users.module';
import { RelationController } from './relation.controller';
import { RelationsController } from './relations.controller';
import { RelationsService } from './relations.service';
import { Relation, RelationSchema } from './schemas/relations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Relation.name, schema: RelationSchema },
    ]),
    ContentsModule,
    forwardRef(() => DocsModule),
    UsersModule,
  ],
  controllers: [RelationsController, RelationController],
  providers: [RelationsService],
  exports: [RelationsService],
})
export class RelationsModule {}
