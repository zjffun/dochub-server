import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DocsService } from 'src/docs/docs.service';
import validatePathPermission from 'src/docs/utils/validatePathPermission';
import { UsersService } from 'src/users/users.service';
import { IRelationDto } from './dto/relation.dto';
import getDocRes from './utils/getDocRes';
import Relation from './utils/Relation';

@Controller('api/doc-relation')
export class DocRelationController {
  constructor(
    private readonly usersService: UsersService,
    private readonly docsService: DocsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createRelationDto: IRelationDto) {
    const docObjectId = new Types.ObjectId(createRelationDto.docId);
    const doc = await this.docsService.findOne({
      _id: docObjectId,
    });

    const userObjectId = new Types.ObjectId(req.user.userId);

    validatePathPermission({
      usersService: this.usersService,
      path: doc.path,
      userObjectId,
    });

    const relation = new Relation({
      fromRange: createRelationDto.fromRange,
      toRange: createRelationDto.toRange,
    });

    doc.relations.push(relation);

    await doc.save();

    return getDocRes(doc);
  }

  @Delete(':docId/:id')
  @UseGuards(JwtAuthGuard)
  async delete(
    @Req() req,
    @Param('docId') docId: string,
    @Param('id') id: string,
  ) {
    const docObjectId = new Types.ObjectId(docId);

    const doc = await this.docsService.findOne({
      _id: docObjectId,
    });

    const userObjectId = new Types.ObjectId(req.user.userId);

    validatePathPermission({
      usersService: this.usersService,
      path: doc.path,
      userObjectId,
    });

    const relationObjectId = new Types.ObjectId(id);

    doc.relations = doc.relations.filter(
      (relation) => !relation._id.equals(relationObjectId),
    );

    await doc.save();

    return getDocRes(doc);
  }
}
