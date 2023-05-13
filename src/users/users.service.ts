import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, SaveOptions, Types } from 'mongoose';
import { Doc, DocDocument } from 'src/docs/schemas/docs.schema';
import PERMISSION from 'src/enums/permission';
import ROLE from 'src/enums/role';
import { User, UserDocument } from './schemas/users.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly usersModel: Model<UserDocument>,
    @InjectModel(Doc.name)
    private readonly docsModel: Model<DocDocument>,
  ) {}

  async findOne(condition) {
    return this.usersModel.findOne(condition).exec();
  }

  async findById(id: string | Types.ObjectId) {
    return this.usersModel.findById(id).exec();
  }

  async create(user: User, options: SaveOptions = {}) {
    const createdUser = await this.usersModel.create([user], options);
    return createdUser[0];
  }

  async upsert(condition, set) {
    const upsertUser = await this.usersModel.updateOne(
      condition,
      { $set: set },
      { upsert: true },
    );

    return upsertUser;
  }

  async validatePathWritePermission({
    path,
    userId,
  }: {
    path: string;
    userId: Types.ObjectId;
  }) {
    const permissionSet = await this.getPathPermissionSet({
      path,
      userId,
    });

    if (
      permissionSet.has(PERMISSION.ADMIN) ||
      permissionSet.has(PERMISSION.WRITE)
    ) {
      return true;
    }

    const user = await this.findById(userId);
    const { login } = user;

    throw new HttpException(
      `${login} doesn't have permissions for ${path}.`,
      HttpStatus.FORBIDDEN,
    );
  }

  async getPathPermissionSet({
    path,
    userId,
  }: {
    path: string;
    userId: Types.ObjectId;
  }) {
    const permissionSet = new Set<PERMISSION>();

    const user = await this.findById(userId);
    const { login, docPermissions } = user;

    if (
      // admin has all permissions
      user.role === ROLE.ADMIN ||
      // user has permission to his own path
      path === `/${login}` ||
      path.startsWith(`/${login}/`)
    ) {
      permissionSet.add(PERMISSION.ADMIN);
      return permissionSet;
    }

    if (docPermissions) {
      const docIdPermissionsMap = Object.fromEntries(
        docPermissions.map((docPermission) => [
          docPermission.docId.toString(),
          docPermission.permissions,
        ]),
      );

      const docs = await this.docsModel
        .find(
          {
            _id: {
              $in: docPermissions.map((p) => p.docId),
            },
          },
          '_id path',
        )
        .lean()
        .exec();

      for (const doc of docs) {
        const docPath = doc.path;
        if (path === docPath || path.startsWith(`${docPath}/`)) {
          const permissions = docIdPermissionsMap[doc._id.toString()];
          if (!permissions) {
            continue;
          }

          permissions.forEach((permission) => {
            permissionSet.add(permission);
          });
        }
      }
    }

    return permissionSet;
  }
}
