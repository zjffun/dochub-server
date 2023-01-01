import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPageInfo } from 'src/types';
import { CreateRelationDto } from './dto/create-relation.dto';
import { Relation, RelationsDocument } from './schemas/relations.schema';

@Injectable()
export class RelationsService {
  constructor(
    @InjectModel(Relation.name)
    private readonly relationsModel: Model<RelationsDocument>,
  ) {}

  async create(createCatDto: CreateRelationDto): Promise<Relation> {
    const createdCat = await this.relationsModel.create(createCatDto);
    return createdCat;
  }

  async getListGroupByPath(
    condition: IPageInfo & { nameId: string },
  ): Promise<{ _id: { fromPath: string; toPath: string } }[]> {
    return this.relationsModel
      .aggregate([
        {
          $match: {
            nameId: condition.nameId,
          },
        },
        {
          $group: {
            _id: { fromPath: '$fromPath', toPath: '$toPath' },
          },
        },
      ])
      .skip(condition.skip)
      .limit(condition.limit)
      .exec();
  }

  async find(condition) {
    const doc = await this.relationsModel
      .find({
        fromPath: condition.fromPath,
        toPath: condition.toPath,
        nameId: condition.nameId,
      })
      .exec();

    return doc;
  }

  async findAll(): Promise<Relation[]> {
    return this.relationsModel.find().exec();
  }

  async findOne(id: string): Promise<Relation> {
    return this.relationsModel.findOne({ _id: id }).exec();
  }

  async delete(id: string) {
    const deletedCat = await this.relationsModel
      .findByIdAndRemove({ _id: id })
      .exec();
    return deletedCat;
  }
}
