import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { gitHashObject } from 'src/utils/gitHashObject';
import { Content, ContentDocument } from './schemas/contents.schema';

@Injectable()
export class ContentsService {
  constructor(
    @InjectModel(Content.name)
    private readonly ContentsModel: Model<ContentDocument>,
  ) {}

  async createByContent(content: string) {
    const sha = await gitHashObject(content);

    const contentInstance = new Content();
    contentInstance.sha = sha;
    contentInstance.content = content;

    const doc = await this.createIfNotExist(contentInstance);

    return doc;
  }

  async createIfNotExist(content: Content) {
    const { sha } = content;

    const doc = await this.ContentsModel.findOneAndUpdate(
      {
        sha,
      },
      { $setOnInsert: content },
      { upsert: true, new: true },
    ).exec();

    return doc;
  }

  async findOne(condition) {
    return this.ContentsModel.findOne({
      sha: condition.sha,
    }).exec();
  }
}
