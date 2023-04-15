import { HttpException, HttpStatus } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from 'src/users/users.service';

export default async ({
  usersService,
  path,
  userObjectId,
}: {
  usersService: UsersService;
  path: string;
  userObjectId: Types.ObjectId;
}) => {
  const user = await usersService.findById(userObjectId);
  const { login, pathPermissions } = user;

  if (path === `/${login}` || path.startsWith(`/${login}/`)) {
    return true;
  }

  if (pathPermissions?.some((p) => path === p || path.startsWith(`${p}/`))) {
    return true;
  }

  throw new HttpException(
    `${login} doesn't have permissions for ${path}.`,
    HttpStatus.FORBIDDEN,
  );
};
