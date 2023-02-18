import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Document, Types } from 'mongoose';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(login: string, pass: string) {
    const user = await this.usersService.findOne({ login });
    // TODO: Add bcrypt
    if (user && user.password === pass) {
      return user;
    }
    return null;
  }

  async findOrCreateGithubUser(userDto: CreateUserDto) {
    const user = await this.usersService.findOne({
      githubId: userDto.githubId,
    });

    if (user) {
      return user;
    }

    return this.usersService.create(userDto);
  }

  async login(
    user: Document<unknown, any, User> &
      User & {
        _id: Types.ObjectId;
      },
  ) {
    return {
      access_token: this.jwtService.sign({
        userId: user._id.toString(),
        role: user.role,
      }),
    };
  }
}
