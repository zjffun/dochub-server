import { Module } from '@nestjs/common';
import { ContentsModule } from 'src/contents/contents.module';
import { DocsModule } from 'src/docs/docs.module';
import { UsersModule } from 'src/users/users.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { DocTreeModule } from 'src/docTree/docTree.module';

@Module({
  imports: [ContentsModule, DocsModule, UsersModule, DocTreeModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
