import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DocsService } from 'src/docs/docs.service';
import { UsersService } from 'src/users/users.service';
import { getProgressInfo } from 'src/utils/getProgressInfo';
import { DocTreeService } from 'src/docTree/docTree.service';
import { DocTree } from 'src/docTree/schemas/docTree.schema';

@Injectable()
export class TasksService {
  constructor(
    private readonly docsService: DocsService,
    private readonly docTreeService: DocTreeService,
  ) {}

  private readonly logger = new Logger(TasksService.name);

  @Cron(CronExpression.EVERY_30_MINUTES)
  async setDocProgress() {
    this.logger.debug('Called setDocProgress');

    const docs = await this.docsService.findAll({});

    for (const doc of docs) {
      const progressInfo = await getProgressInfo(doc.relations);

      const docTreeNode = new DocTree();
      docTreeNode.path = doc.path;
      docTreeNode.totalLineNum = progressInfo.totalLineNum;
      docTreeNode.translatedLineNum = progressInfo.translatedLineNum;
      docTreeNode.consistentLineNum = progressInfo.consistentLineNum;

      await this.docTreeService.addNode(docTreeNode);
    }

    await this.docTreeService.calcNodes();

    return true;
  }
}
