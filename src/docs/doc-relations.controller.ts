import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import { DocsService } from 'src/docs/docs.service';
import { UsersService } from 'src/users/users.service';
import { IRelationDto } from './dto/relation.dto';
import getDocRes from './utils/getDocRes';
import Relation from './utils/Relation';

@Controller(apiPrefix)
export class DocRelationsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly docsService: DocsService,
  ) {}

  @Post('v1/doc/relation')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createRelationDto: IRelationDto) {
    const docObjectId = new Types.ObjectId(createRelationDto.docId);
    const doc = await this.docsService.findOne({
      _id: docObjectId,
    });

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: doc.path,
      userId: userObjectId,
    });

    const relation = new Relation({
      fromRange: createRelationDto.fromRange,
      toRange: createRelationDto.toRange,
    });

    doc.relations.push(relation);

    await doc.save();

    return getDocRes(doc);
  }

  @Delete('v1/doc/relation')
  @UseGuards(JwtAuthGuard)
  async delete(@Req() req, @Body() relationDto: IRelationDto) {
    const docObjectId = new Types.ObjectId(relationDto.docId);

    const doc = await this.docsService.findOne({
      _id: docObjectId,
    });

    const userObjectId = new Types.ObjectId(req.user.userId);

    await this.usersService.validatePathWritePermission({
      path: doc.path,
      userId: userObjectId,
    });

    const relationObjectId = new Types.ObjectId(relationDto.id);

    doc.relations = doc.relations.filter(
      (relation) => !relation._id.equals(relationObjectId),
    );

    await doc.save();

    return getDocRes(doc);
  }
}
