import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { apiPrefix } from 'src/config';
import PERMISSION from 'src/enums/permission';
import ROLE from 'src/enums/role';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { IProjectDto } from './dto/project.dto';
import { ProjectsService } from './projects.service';
import { Project } from './schemas/projects.schema';
import { DocTreeService } from 'src/docTree/docTree.service';

@Controller(apiPrefix)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly docTreeService: DocTreeService,
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Get('v1/projects')
  async get() {
    const list = await this.projectsService.findAll();
    const total = await this.projectsService.count();
    const resultList = [];
    for (const item of list) {
      const docTreeNode = await this.docTreeService.findOne({
        path: item.path,
      });

      resultList.push({
        ...item.toJSON(),
        ...docTreeNode.toJSON(),
      });
    }

    const result = {
      list: resultList,
      total,
    };

    return result;
  }

  @Post('v1/project')
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createDocDto: IProjectDto) {
    const { path: docPath } = createDocDto;

    const userObjectId = new Types.ObjectId(req.user.userId);

    if (/^\/[^/]+$/.test(docPath) === false) {
      throw new HttpException(
        `Doc path ${docPath} is not valid.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const projectUserLogin = docPath.substring(1);

    // check if doc exists
    const docCheckResult = await this.projectsService.findOne({
      path: docPath,
    });

    // check if user exists
    const userCheckResult = await this.usersService.findOne({
      login: projectUserLogin,
    });

    if (docCheckResult || userCheckResult) {
      throw new HttpException(
        `Doc path ${docPath} already exists.`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const doc = new Project();

    doc.createUserObjectId = userObjectId;
    doc.path = docPath;
    doc.depth = docPath.split('/').length - 1;
    doc.name = createDocDto.name;
    doc.desc = createDocDto.desc;
    doc.lang = createDocDto.lang;
    doc.docUrl = createDocDto.docUrl;
    doc.logoUrl = createDocDto.logoUrl;
    doc.groupName = createDocDto.groupName;

    const user = new User();
    user.login = projectUserLogin;
    user.role = ROLE.PROJECT;

    await this.connection.transaction(async (session) => {
      const currentDoc = await this.projectsService.create(doc, { session });
      await this.usersService.create(user, { session });

      // add permission
      const currentUser = await this.usersService.findById(req.user.userId);
      currentUser.docPermissions.push({
        docId: currentDoc._id,
        permissions: [PERMISSION.ADMIN],
      });
      await currentUser.save({ session });
    });

    return {
      path: doc.path,
    };
  }
}
