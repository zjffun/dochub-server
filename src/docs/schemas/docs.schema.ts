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
  fromLineNum: number;

  @Prop()
  toLineNum: number;

  @Prop()
  consistentLineNum: number;

  @Prop()
  fromOwner: string;

  @Prop()
  fromRepo: string;

  @Prop()
  fromBranch: string;

  @Prop()
  fromPath: string;

  @Prop()
  fromOriginalRev: string;

  @Prop()
  fromModifiedRev: string;

  @Prop()
  fromOriginalContentSha: string;

  @Prop()
  fromModifiedContentSha: string;

  @Prop()
  toOwner: string;

  @Prop()
  toRepo: string;

  @Prop()
  toBranch: string;

  @Prop()
  toPath: string;

  @Prop()
  toOriginalRev: string;

  @Prop()
  toModifiedRev: string;

  @Prop()
  toOriginalContentSha: string;

  @Prop()
  toModifiedContentSha: string;

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
