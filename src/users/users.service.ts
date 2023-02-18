import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UsersDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UsersDocument>,
  ) {}

  async findOne(condition: CreateUserDto) {
    return this.usersModel.findOne(condition).exec();
  }

  async findById(id: string) {
    return this.usersModel.findById(id).exec();
  }

  async create(userDto: CreateUserDto) {
    const createdUser = await this.usersModel.create(userDto);
    return createdUser;
  }

  async upsert(condition: CreateUserDto, set: CreateUserDto) {
    const upsertUser = await this.usersModel.updateOne(
      condition,
      { $set: set },
      { upsert: true },
    );

    return upsertUser;
  }
}
