import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { IJwtUser } from 'src/auth/jwt.strategy';
import { UsersService } from './users.service';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('user')
  async getUser(@Request() req) {
    const { pick } = await import('lodash-es');
    const jwtUser = req.user as IJwtUser;
    const userInfo = await this.usersService.findById(jwtUser.userId);
    const result = pick(userInfo, ['name', 'role', 'avatarUrl', 'email']);
    return result;
  }
}
