import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { getPageInfo } from 'src/utils/page';
import { CreateRelationDto } from './dto/create-relation.dto';
import { RelationsService } from './relations.service';
import { Relation } from './schemas/relations.schema';

@Controller('relations')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post()
  async create(@Body() createRelationDto: CreateRelationDto) {
    await this.relationsService.create(createRelationDto);
  }

  @Get('/getListGroupByPath')
  async getListGroupByPath(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ): Promise<{ fromPath: string; toPath: string }[]> {
    const pageInfo = getPageInfo(page, pageSize);
    const list = await this.relationsService.getListGroupByPath(pageInfo);
    const result = list.map((d) => d._id);

    return result;
  }

  @Get('/getRelationViewerData')
  async getRelationViewerData(
    @Query('fromPath') fromPath: string,
    @Query('toPath') toPath: string,
  ): Promise<any> {
    const { RelationServer, Relation: RelationClass } = await import(
      'relation2-core'
    );

    const cwd = '/Users/zjf/gh/translated-content-relation';

    const rawRelations = await this.relationsService.find({
      fromPath,
      toPath,
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Relation> {
    return this.relationsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.relationsService.delete(id);
  }
}
