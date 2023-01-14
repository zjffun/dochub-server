import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RelationsService } from 'src/relations/relations.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { Collection, CollectionsDocument } from './schemas/collections.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private readonly collectionsModel: Model<CollectionsDocument>,
    private readonly relationsService: RelationsService,
  ) {}

  async setProgressInfo() {
    const collections = await this.collectionsModel.find().exec();

    for (const collection of collections) {
      const condition = {
        nameId: collection.nameId,
      };

      const originalLineNum = await this.relationsService.getOriginalLineNum(
        condition,
      );

      const translatedLineNum =
        await this.relationsService.getTranslatedLineNum(condition);

      const consistentLineNum =
        await this.relationsService.getConsistentLineNum(condition);

      collection.originalLineNum = originalLineNum;
      collection.translatedLineNum = translatedLineNum;
      collection.consistentLineNum = consistentLineNum;

      await collection.save();
    }

    return true;
  }

  async create(createCatDto: CreateCollectionDto): Promise<Collection> {
    const createdCollection = await this.collectionsModel.create(createCatDto);
    return createdCollection;
  }

  async findAll() {
    return this.collectionsModel.find().exec();
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
