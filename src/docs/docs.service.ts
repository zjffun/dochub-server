import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RelationsService } from 'src/relations/relations.service';
import { UsersService } from 'src/users/users.service';
import { Doc, DocDocument } from './schemas/docs.schema';
import getCondition, { IRawCondition } from './utils/getCondition';

@Injectable()
export class DocsService {
  constructor(
    @InjectModel(Doc.name)
    private readonly DocsModel: Model<DocDocument>,
    private readonly relationsService: RelationsService,
    private readonly usersService: UsersService,
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

  async create(collection: Doc) {
    const createdCollection = await this.DocsModel.create(collection);
    return createdCollection;
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
