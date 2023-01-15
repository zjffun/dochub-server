import { Controller, Get } from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { Collection } from './schemas/collections.schema';

@Controller('api/collections')
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}

  // @Post()
  // async create(@Body() createRelationDto: CreateCollectionDto) {
  //   await this.collectionsService.create(createRelationDto);
  // }

  @Get()
  async findAll(): Promise<Collection[]> {
    const collections = await this.collectionsService.findAll();

    return collections;
  }

  @Get('/setProgressInfo')
  async setProgressInfo() {
    return this.collectionsService.setProgressInfo();
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string): Promise<Collection> {
  //   return this.collectionsService.findOne(id);
  // }

  // @Delete(':id')
  // async delete(@Param('id') id: string) {
  //   return this.collectionsService.delete(id);
  // }
}
