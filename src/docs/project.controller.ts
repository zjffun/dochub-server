import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ContentsService } from 'src/contents/contents.service';
import PERMISSION from 'src/enum/permission';
import ROLE from 'src/enum/role';
import { User } from 'src/users/schemas/users.schema';
import { UsersService } from 'src/users/users.service';
import { DocsService } from './docs.service';
import { IDocDto } from './dto/doc.dto';
import { Doc } from './schemas/docs.schema';

@Controller('api/project')
export class ProjectController {
  constructor(
    private readonly docsService: DocsService,
    private readonly contentsService: ContentsService,
    private readonly usersService: UsersService,
    @InjectConnection() private readonly connection: mongoose.Connection,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req, @Body() createDocDto: IDocDto) {
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
    const docCheckResult = await this.docsService.findOne({
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

    const doc = new Doc();

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
      const currentDoc = await this.docsService.create(doc, { session });
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
