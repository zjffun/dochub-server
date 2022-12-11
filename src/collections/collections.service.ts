import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { Collection, CollectionsDocument } from './schemas/collections.schema';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private readonly relationsModel: Model<CollectionsDocument>,
  ) {}

  async create(createCatDto: CreateCollectionDto): Promise<Collection> {
    const createdCat = await this.relationsModel.create(createCatDto);
    return createdCat;
  }

  async findAll(): Promise<Collection[]> {
    return this.relationsModel.find().exec();
  }

  async findOne(id: string): Promise<Collection> {
    return this.relationsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.relationsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
