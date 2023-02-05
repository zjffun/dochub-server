import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UsersDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UsersDocument>,
  ) {}

  async findOne(username: string) {
    return this.usersModel
      .findOne({
        username,
      })
      .exec();
  }
}
