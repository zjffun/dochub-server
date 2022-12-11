import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { RelationsService } from './relations.service';
import { CreateRelationDto } from './dto/create-relation.dto';
import { Relation } from './schemas/relations.schema';

@Controller('relations')
export class RelationsController {
  constructor(private readonly relationsService: RelationsService) {}

  @Post()
  async create(@Body() createRelationDto: CreateRelationDto) {
    await this.relationsService.create(createRelationDto);
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
