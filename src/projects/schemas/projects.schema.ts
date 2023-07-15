import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema({})
export class Project {
  @Prop()
  path: string;

  @Prop()
  depth: number;

  @Prop()
  name: string;

  @Prop()
  lang: string;

  @Prop()
  desc: string;

  @Prop()
  docUrl: string;

  @Prop()
  logoUrl: string;

  @Prop()
  groupName: string;

  @Prop()
  isDelete: boolean;

  @Prop()
  createUserObjectId: Types.ObjectId;

  @Prop()
  updateUserObjectId: Types.ObjectId;

  @Prop()
  deleteUserObjectId: Types.ObjectId;

  @Prop()
  deleteDate: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
