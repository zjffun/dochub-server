import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UsersDocument = HydratedDocument<User>;

@Schema({
  collection: 'users',
})
export class User {
  @Prop()
  login: string;

  @Prop()
  password: string;

  @Prop()
  role: string;

  @Prop()
  name: string;

  @Prop()
  avatarUrl: string;

  @Prop()
  email: string;

  @Prop()
  githubId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
