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
import { DocsService } from './docs.service';
import { CreateCollectionDto } from './dto/create-doc.dto';
import { Doc } from './schemas/docs.schema';

@Controller('api/docs')
export class DocsController {
  constructor(
    private readonly docsService: DocsService,
    private readonly relationsService: RelationsService,
  ) {}

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('pageSize') pageSize: string,
    @Query('path') path: string,
    @Query('depth') depthQuery: string,
  ) {
    const pageInfo = getPageInfo(page, pageSize);
    const depth = Number(depthQuery);

    const list = await this.docsService.findAll({
      ...pageInfo,
      path,
      depth,
    });

    const total = await this.docsService.count({
      path,
      depth,
    });

    const result = {
      list,
      total,
    };

    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Doc> {
    return this.docsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async create(@Body() createRelationDto: CreateCollectionDto) {
    await this.docsService.create(createRelationDto);
  }

  @Put('progress-info/:nameId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async setProgressInfoByNameId(@Param('nameId') nameId: string) {
    return this.docsService.setProgressInfo(nameId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Rules('admin')
  async delete(@Param('id') id: string) {
    return this.docsService.delete(id);
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
