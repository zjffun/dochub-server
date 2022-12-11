import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { Collection } from './schemas/collections.schema';

@Controller('collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  @Post()
  async create(@Body() createRelationDto: CreateCollectionDto) {
    await this.collectionsService.create(createRelationDto);
  }

  @Get()
  async findAll(): Promise<Collection[]> {
    return this.collectionsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Collection> {
    return this.collectionsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }
}
