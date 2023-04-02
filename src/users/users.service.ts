import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UsersDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UsersDocument>,
  ) {}

  async findOne(condition) {
    return this.usersModel.findOne(condition).exec();
  }

  async findById(id: string | Types.ObjectId) {
    return this.usersModel.findById(id).exec();
  }

  async create(user) {
    const createdUser = await this.usersModel.create(user);
    return createdUser;
  }

  async upsert(condition, set) {
    const upsertUser = await this.usersModel.updateOne(
      condition,
      { $set: set },
      { upsert: true },
    );

    return upsertUser;
  }
}
