import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IJwtUser } from 'src/auth/jwt.strategy';
import { apiPrefix } from 'src/config';
import { UsersService } from './users.service';

@Controller(apiPrefix)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('v1/user')
  async getUser(@Query('login') login: string) {
    const { pick } = await import('lodash-es');
    const user = await this.usersService.findOne({
      login,
    });
    const result = pick(user, ['login', 'name', 'avatarUrl', 'email']);
    return result;
  }

  @Get('v1/current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const { pick } = await import('lodash-es');
    const jwtUser = req.user as IJwtUser;
    const user = await this.usersService.findById(jwtUser.userId);

    if (!user) {
      throw new Error('User not found');
    }

    const result = pick(user, ['login', 'name', 'role', 'avatarUrl', 'email']);
    return result;
  }

  @Get('v1/current-user/permissions')
  @UseGuards(JwtAuthGuard)
  async getCurrentUserPermission(@Request() req, @Query('path') path: string) {
    const userObjectId = new Types.ObjectId(req.user.userId);

    const permissionSet = await this.usersService.getPathPermissionSet({
      path: path,
      userId: userObjectId,
    });

    return [...permissionSet];
  }
}
