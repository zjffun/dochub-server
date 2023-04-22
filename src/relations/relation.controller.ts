import { Controller, Delete, Param, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DocsService } from 'src/docs/docs.service';
import validatePathPermission from 'src/docs/utils/validatePathPermission';
import { UsersService } from 'src/users/users.service';
import { RelationsService } from './relations.service';

@Controller('api/relation')
export class RelationController {
  constructor(
    private readonly relationsService: RelationsService,
    private readonly usersService: UsersService,
    private readonly docsService: DocsService,
  ) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Param('id') id: string) {
    const relation = await this.relationsService.findOne(id);

    const doc = await this.docsService.findOne({
      _id: relation.docObjectId,
    });

    const userObjectId = new Types.ObjectId(req.user.userId);

    validatePathPermission({
      usersService: this.usersService,
      path: doc.path,
      userObjectId,
    });

    await this.relationsService.delete(id);

    return true;
  }
}
