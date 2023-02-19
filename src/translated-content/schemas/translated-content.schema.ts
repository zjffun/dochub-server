import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TranslatedContentDocument = HydratedDocument<TranslatedContent>;

@Schema({
  collection: 'translated-content',
})
export class TranslatedContent {
  @Prop()
  userObjectId: Types.ObjectId;

  @Prop()
  nameId: string;

  @Prop()
  fromPath: string;

  @Prop()
  toPath: string;

  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  state: string;
}

export const TranslatedContentSchema =
  SchemaFactory.createForClass(TranslatedContent);
