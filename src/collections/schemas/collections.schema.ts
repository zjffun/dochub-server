import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CollectionsDocument = HydratedDocument<Collection>;

@Schema({})
export class Collection {
  @Prop()
  nameId: string;

  @Prop()
  name: string;

  @Prop()
  groupName: string;

  @Prop()
  lang: string;

  @Prop()
  desc: string;

  @Prop()
  originalLineNum: number;

  @Prop()
  translatedLineNum: number;

  @Prop()
  consistentLineNum: number;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
