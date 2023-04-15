import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocDocument = HydratedDocument<Doc>;

@Schema({})
export class Doc {
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
  groupName: string;

  @Prop()
  originalLineNum: number;

  @Prop()
  translatedLineNum: number;

  @Prop()
  consistentLineNum: number;

  @Prop()
  originalOwner: string;

  @Prop()
  originalRepo: string;

  @Prop()
  originalBranch: string;

  @Prop()
  originalPath: string;

  @Prop()
  originalRev: string;

  @Prop()
  originalContentSha: string;

  @Prop()
  translatedOwner: string;

  @Prop()
  translatedRepo: string;

  @Prop()
  translatedBranch: string;

  @Prop()
  translatedPath: string;

  @Prop()
  translatedRev: string;

  @Prop()
  translatedContentSha: string;

  @Prop()
  createUserObjectId: Types.ObjectId;

  @Prop()
  updateUserObjectId: Types.ObjectId;

  @Prop()
  isDelete: boolean;

  @Prop()
  deleteUserObjectId: Types.ObjectId;

  @Prop()
  deleteDate: Date;
}

export const DocSchema = SchemaFactory.createForClass(Doc);
