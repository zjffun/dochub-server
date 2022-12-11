import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CollectionsDocument = HydratedDocument<Collection>;

@Schema({})
export class Collection {
  @Prop()
  name: string;

  @Prop()
  groupName: string;

  @Prop()
  lang: string;

  @Prop()
  desc: string;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);
