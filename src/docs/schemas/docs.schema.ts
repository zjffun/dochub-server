import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import Relation from '../utils/Relation';

export type DocDocument = HydratedDocument<Doc>;

@Schema({})
export class Doc {
  @Prop()
  path: string;

  @Prop()
  depth: number;

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
  toEditingContentSha: string;

  @Prop()
  relations: Relation[];

  @Prop()
  pullNumber: number;

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
