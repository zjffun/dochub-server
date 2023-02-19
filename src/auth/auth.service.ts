import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Document, Types } from 'mongoose';
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

  async findOrCreateGithubUser(user: User) {
    const currentUser = await this.usersService.findOne({
      githubId: user.githubId,
    });

    if (currentUser) {
      return currentUser;
    }

    return this.usersService.create(user);
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
