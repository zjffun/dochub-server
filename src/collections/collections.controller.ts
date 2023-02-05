import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RelationsService } from 'src/relations/relations.service';
import { getPageInfo } from 'src/utils/page';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { Collection } from './schemas/collections.schema';

@Controller('api/collections')
export class CollectionsController {
  constructor(
    private readonly collectionsService: CollectionsService,
    private readonly relationsService: RelationsService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
  ) {
    const pageInfo = getPageInfo(page, pageSize);

    const list = await this.collectionsService.findAll({
      ...pageInfo,
    });

    const total = await this.collectionsService.count();

    const result = {
      list,
      total,
    };

    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Collection> {
    return this.collectionsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createRelationDto: CreateCollectionDto) {
    await this.collectionsService.create(createRelationDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('progress-info/:nameId')
  async setProgressInfoByNameId(@Param('nameId') nameId: string) {
    return this.collectionsService.setProgressInfo(nameId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('relations/:nameId')
  async deleteRelations(@Param('nameId') nameId: string) {
    if (!nameId) {
      throw new Error('nameId is required');
    }

    return this.relationsService.deleteByNameId(nameId);
  }
}
