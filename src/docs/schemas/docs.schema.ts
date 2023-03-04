import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
}

export const DocSchema = SchemaFactory.createForClass(Doc);
