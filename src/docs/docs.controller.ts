import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JwtStrategy } from 'src/auth/jwt.strategy';
import Rules from 'src/decorators/rules';
import { RolesGuard } from 'src/guards/roles.guard';
import { UsersService } from 'src/users/users.service';
import { getPageInfo } from 'src/utils/page';
import { DocsService } from './docs.service';

@Controller('api/docs')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async findAll(
    @Req() req,
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('path') path: string,
    @Query('depth') depthQuery: string,
    @Query('isDelete') isDeleteQuery: string,
  ) {
    const pageInfo = getPageInfo(page, pageSize);
    const depth = Number(depthQuery);
    const isDelete = isDeleteQuery === 'true';

    if (isDelete) {
      const jwtStrategy = new JwtStrategy();
      const user = await jwtStrategy.getUser(req);
      const userObjectId = new Types.ObjectId(user.userId);

      await this.usersService.validatePathPermission({
        path,
        userId: userObjectId,
      });
    }

    const list = await this.docsService.findAll({
      ...pageInfo,
      path,
      depth,
      isDelete,
    });

    const total = await this.docsService.count({
      path,
      depth,
      isDelete,
    });

    const result = {
      list,
      total,
    };

    return result;
  }

  @Put('progress-info/:nameId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async setProgressInfoByNameId(@Param('nameId') nameId: string) {
    return this.docsService.setProgressInfo(nameId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async delete(@Param('id') id: string) {
    return this.docsService.delete(id);
  }
}
