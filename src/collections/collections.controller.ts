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
import Rules from 'src/decorators/rules';
import { RolesGuard } from 'src/guards/roles.guard';
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

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async create(@Body() createRelationDto: CreateCollectionDto) {
    await this.collectionsService.create(createRelationDto);
  }

  @Put('progress-info/:nameId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async setProgressInfoByNameId(@Param('nameId') nameId: string) {
    return this.collectionsService.setProgressInfo(nameId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async delete(@Param('id') id: string) {
    return this.collectionsService.delete(id);
  }

  @Delete('relations/:nameId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async deleteRelations(@Param('nameId') nameId: string) {
    if (!nameId) {
      throw new Error('nameId is required');
    }

    return this.relationsService.deleteByNameId(nameId);
  }
}
