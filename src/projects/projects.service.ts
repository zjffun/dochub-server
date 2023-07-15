import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import { Project, ProjectDocument } from './schemas/projects.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name)
    private readonly DocsModel: Model<ProjectDocument>,
  ) {}

  async findAll() {
    const query = this.DocsModel.find({});

    return query.exec();
  }

  async count() {
    return this.DocsModel.find({}).count().exec();
  }

  async create(collection: Project, options: SaveOptions = {}) {
    const createdCollection = await this.DocsModel.create(
      [collection],
      options,
    );
    return createdCollection[0];
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
}
