import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IJwtUser } from 'src/auth/jwt.strategy';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async getUser(@Request() req) {
    const { pick } = await import('lodash-es');
    const jwtUser = req.user as IJwtUser;
    const user = await this.usersService.findById(jwtUser.userId);
    const result = pick(user, ['login', 'name', 'role', 'avatarUrl', 'email']);
    return result;
  }

  @Get('user/:login')
  async getUserByLogin(@Param('login') login: string) {
    const { pick } = await import('lodash-es');
    const user = await this.usersService.findOne({
      login,
    });
    const result = pick(user, ['login', 'name', 'avatarUrl', 'email']);
    return result;
  }
}
