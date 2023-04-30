import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { DocsService } from 'src/docs/docs.service';
import validatePathPermission from 'src/docs/utils/validatePathPermission';
import { UsersService } from 'src/users/users.service';
import { getPageInfo } from 'src/utils/page';
import { CreateRelationDto } from './dto/create-relation.dto';
import { RelationsService } from './relations.service';
import { Relation } from './schemas/relations.schema';

@Controller('api/relations')
export class RelationsController {
  constructor(
    private readonly relationsService: RelationsService,
    private readonly usersService: UsersService,
    private readonly docsService: DocsService,
  ) {}

  @Get('path-list')
  async getListGroupByPath(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('nameId') nameId: string,
  ) {
    const pageInfo = getPageInfo(page, pageSize);

    const list = await this.relationsService.getListGroupByPath({
      ...pageInfo,
      nameId,
    });

    const resultList = [];

    for (const { _id: item } of list) {
      const condition = {
        fromPath: item.fromPath,
        toPath: item.toPath,
        nameId,
      };
      const originalLineNum = await this.relationsService.getFromLineNum(
        condition,
      );
      const translatedLineNum = await this.relationsService.getToLineNum(
        condition,
      );
      const consistentLineNum =
        await this.relationsService.getConsistentLineNum(condition);

      const resultItem = {
        fromPath: item.fromPath,
        toPath: item.toPath,
        nameId,
        originalLineNum,
        translatedLineNum,
        consistentLineNum,
      };

      resultList.push(resultItem);
    }

    const total = await this.relationsService.getListGroupByPathCount({
      nameId,
    });

    const result = {
      total,
      list: resultList,
    };

    return result;
  }

  @Get()
  async findAll(): Promise<Relation[]> {
    return this.relationsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Relation> {
    return this.relationsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req,
    @Body() batchCreateRelationDto: CreateRelationDto[],
  ) {
    const relations = [];

    const userObjectId = new Types.ObjectId(req.user.userId);

    for (const createRelationDto of batchCreateRelationDto) {
      const docObjectId = new Types.ObjectId(createRelationDto.docObjectId);
      const doc = await this.docsService.findOne({
        _id: docObjectId,
      });

      validatePathPermission({
        usersService: this.usersService,
        path: doc.path,
        userObjectId,
      });

      const relation = new Relation();
      relation.docObjectId = doc._id;
      relation.fromRange = createRelationDto.fromRange;
      relation.toRange = createRelationDto.toRange;
      relations.push(relation);
    }

    await this.relationsService.create(relations);

    return true;
  }
}
