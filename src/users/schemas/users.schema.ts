import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import PERMISSION from 'src/enums/permission';
import ROLE from 'src/enums/role';

export type UserDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
})
export class User {
  @Prop()
  login: string;

  @Prop()
  password: string;

  @Prop()
  role: ROLE;

  @Prop()
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  email: string;

  @Prop()
  githubId: string;

  @Prop()
  projectPermissions: {
    projectId: Types.ObjectId;
    permissions: PERMISSION[];
  }[];

  // TODO: fix vulnerable
  @Prop()
  githubToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
