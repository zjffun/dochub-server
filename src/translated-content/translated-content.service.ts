import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  TranslatedContent,
  TranslatedContentDocument,
} from './schemas/translated-content.schema';

@Injectable()
export class TranslatedContentService {
  constructor(
    @InjectModel(TranslatedContent.name)
    private readonly TranslatedContentModel: Model<TranslatedContentDocument>,
  ) {}

  async createOrUpdate(translatedContent: TranslatedContent) {
    const { userObjectId, fromPath, toPath, nameId, title } = translatedContent;

    const doc = await this.TranslatedContentModel.findOneAndUpdate(
      {
        userObjectId,
        fromPath,
        toPath,
        nameId,
        title,
      },
      translatedContent,
      { upsert: true, new: true },
    ).exec();

    return doc;
  }

  async find(condition) {
    const doc = await this.TranslatedContentModel.find({
      fromPath: condition.fromPath,
      toPath: condition.toPath,
      nameId: condition.nameId,
    }).exec();

    return doc;
  }

  async findAll(): Promise<TranslatedContent[]> {
    return this.TranslatedContentModel.find().exec();
  }

  async findOne(id: string): Promise<TranslatedContent> {
    return this.TranslatedContentModel.findOne({ _id: id }).exec();
  }

  async findForViewer(condition: {
    login: string;
    nameId: string;
    title: string;
  }): Promise<TranslatedContent> {
    return this.TranslatedContentModel.findOne({
      login: condition.login,
      nameId: condition.nameId,
      title: condition.title,
    }).exec();
  }

  async delete(id: string) {
    const deletedTranslatedContent =
      await this.TranslatedContentModel.findByIdAndRemove({ _id: id }).exec();
    return deletedTranslatedContent;
  }
}
