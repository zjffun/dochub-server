import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RelationsService } from 'src/relations/relations.service';
import { Collection, CollectionsDocument } from './schemas/collections.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionsModel: Model<CollectionsDocument>,
    private readonly relationsService: RelationsService,
  ) {}

  async setProgressInfo(nameId: string) {
    const condition = {
      nameId: nameId,
    };

    const collection = await this.collectionsModel.findOne(condition).exec();

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

  async create(collection): Promise<Collection> {
    const createdCollection = await this.collectionsModel.create(collection);
    return createdCollection;
  }

  async findAll(condition) {
    return this.collectionsModel
      .find()
      .skip(condition.skip)
      .limit(condition.limit)
      .exec();
  }

  async count() {
    return this.collectionsModel.find().count().exec();
  }

  async findOne(id: string): Promise<Collection> {
    return this.collectionsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCollection = await this.collectionsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCollection;
  }
}
