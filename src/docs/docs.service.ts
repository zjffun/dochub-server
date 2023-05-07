import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import { Doc, DocDocument } from './schemas/docs.schema';
import getCondition, { IRawCondition } from './utils/getCondition';

@Injectable()
export class DocsService {
  constructor(
    @InjectModel(Doc.name)
    private readonly DocsModel: Model<DocDocument>,
  ) {}

  async setProgressInfo(nameId: string) {
    const condition = {
      nameId: nameId,
    };

    const collection = await this.DocsModel.findOne(condition).exec();

    // const fromLineNum = await this.relationsService.getFromLineNum(condition);

    // const toLineNum = await this.relationsService.getToLineNum(condition);

    // const consistentLineNum = await this.relationsService.getConsistentLineNum(
    //   condition,
    // );

    // collection.fromLineNum = fromLineNum;
    // collection.toLineNum = toLineNum;
    // collection.consistentLineNum = consistentLineNum;

    await collection.save();

    return true;
  }

  async create(collection: Doc, options: SaveOptions = {}) {
    const createdCollection = await this.DocsModel.create(
      [collection],
      options,
    );
    return createdCollection[0];
  }

  async findAll({
    path,
    depth,
    skip,
    limit,
    isDelete,
  }: {
    skip?: number;
    limit?: number;
  } & IRawCondition) {
    const condition = getCondition({ path, depth, isDelete });

    let query = this.DocsModel.find(condition);

    if (skip !== undefined) {
      query = query.skip(skip);
    }

    if (limit !== undefined) {
      query = query.limit(limit);
    }

    return query.exec();
  }

  async count({ path, depth, isDelete }: IRawCondition) {
    const condition = getCondition({ path, depth, isDelete });

    return this.DocsModel.find(condition).count().exec();
  }

  async findOne(condition: { _id?: Types.ObjectId; path?: string }) {
    const filter = {};

    if (condition._id !== undefined) {
      filter['_id'] = condition._id;
    }

    if (condition.path !== undefined) {
      filter['path'] = condition.path;
    }

    return this.DocsModel.findOne(filter).exec();
  }

  async delete(id: string) {
    const deletedCollection = await this.DocsModel.findByIdAndRemove({
      _id: id,
    }).exec();
    return deletedCollection;
  }
}
