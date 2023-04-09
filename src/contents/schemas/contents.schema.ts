import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContentDocument = HydratedDocument<Content>;

@Schema({})
export class Content {
  @Prop()
  sha: string;

  @Prop()
  content: string;
}

export const ContentsSchema = SchemaFactory.createForClass(Content);
