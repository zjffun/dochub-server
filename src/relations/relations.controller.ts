import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import * as path from 'path';
import { dataPath } from 'src/config';
import { getPageInfo } from 'src/utils/page';
import { CreateRelationDto } from './dto/create-relation.dto';
import { RelationsService } from './relations.service';
import { Relation } from './schemas/relations.schema';

@Controller('relations')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  // @Post()
  // async create(@Body() createRelationDto: CreateRelationDto) {
  //   await this.relationsService.create(createRelationDto);
  // }

  @Get('/getListGroupByPath')
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

  @Get('/getRelationViewerData')
  async getRelationViewerData(
    @Query('fromPath') fromPath: string,
    @Query('toPath') toPath: string,
    @Query('nameId') nameId: string,
  ): Promise<any> {
    const { RelationServer, Relation: RelationClass } = await import(
      'relation2-core'
    );

    const cwd = path.join(dataPath, nameId);

    const rawRelations = await this.relationsService.find({
      fromPath,
      toPath,
      nameId,
    });

    const relations = rawRelations.map((rawRelation) => {
      return new RelationClass({
        workingDirectory: cwd,
        ...rawRelation.toObject(),
      });
    });

    const relationServer = new RelationServer(cwd);

    const relationViewerData = await relationServer.getRelationViewerData(
      relations,
    );

    return relationViewerData;
  }

  @Get()
  async findAll(): Promise<Relation[]> {
    return this.relationsService.findAll();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Relation> {
  //   return this.relationsService.findOne(id);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.relationsService.delete(id);
  // }
}
