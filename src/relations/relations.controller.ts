import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import Rules from 'src/decorators/rules';
import { RolesGuard } from 'src/guards/roles.guard';
import { ContentsService } from 'src/contents/contents.service';
import { getPageInfo } from 'src/utils/page';
import { CreateRelationDto } from './dto/create-relation.dto';
import { RelationsService } from './relations.service';
import { Relation } from './schemas/relations.schema';

@Controller('api/relations')
export class RelationsController {
  constructor(
    private readonly relationsService: RelationsService,
    private readonly contentsService: ContentsService,
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
      const originalLineNum = await this.relationsService.getOriginalLineNum(
        condition,
      );
      const translatedLineNum =
        await this.relationsService.getTranslatedLineNum(condition);
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async create(
    @Body() createRelationDto: CreateRelationDto | CreateRelationDto[],
  ) {
    // TODO: create Relation obj
    await this.relationsService.create(createRelationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async delete(@Param('id') id: string) {
    return this.relationsService.delete(id);
  }
}
