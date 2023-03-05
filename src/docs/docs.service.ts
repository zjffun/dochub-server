import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RelationsService } from 'src/relations/relations.service';
import { IPageInfo } from 'src/types';
import { Doc, DocDocument } from './schemas/docs.schema';

export type IConditions = {
  depth?: number;
} & Partial<IPageInfo> &
  Partial<Doc>;

@Injectable()
export class DocsService {
  constructor(
    @InjectModel(Doc.name)
    private readonly DocsModel: Model<DocDocument>,
    private readonly relationsService: RelationsService,
  ) {}

  async setProgressInfo(nameId: string) {
    const condition = {
      nameId: nameId,
    };

    const collection = await this.DocsModel.findOne(condition).exec();

    const originalLineNum = await this.relationsService.getOriginalLineNum(
      condition,
    );

    const translatedLineNum = await this.relationsService.getTranslatedLineNum(
      condition,
    );

    const consistentLineNum = await this.relationsService.getConsistentLineNum(
      condition,
    );

    collection.originalLineNum = originalLineNum;
    collection.translatedLineNum = translatedLineNum;
    collection.consistentLineNum = consistentLineNum;

    await collection.save();

    return true;
  }

  async create(collection): Promise<Doc> {
    const createdCollection = await this.DocsModel.create(collection);
    return createdCollection;
  }

  async findAll(condition: IConditions) {
    const pathRegExp = new RegExp(`^${condition.path}[^$]`);
    const maxPathSize = condition.path.split('/').length - 1 + condition.depth;

    return this.DocsModel.find({
      path: pathRegExp,
      depth: {
        $lt: maxPathSize,
      },
    })
      .skip(condition.skip)
      .limit(condition.limit)
      .exec();
  }

  async count(condition: IConditions) {
    const pathRegExp = new RegExp(`^${condition.path}[^$]`);
    const maxPathSize = condition.path.split('/').length - 1 + condition.depth;

    return this.DocsModel.find({
      path: pathRegExp,
      depth: {
        $lt: maxPathSize,
      },
    })
      .count()
      .exec();
  }

  async findOne(id: string): Promise<Doc> {
    return this.DocsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCollection = await this.DocsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCollection;
  }
}
