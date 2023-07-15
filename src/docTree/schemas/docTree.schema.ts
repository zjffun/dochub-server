import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DocTreeDocument = HydratedDocument<DocTree>;

@Schema({})
export class DocTree {
  @Prop()
  path: string;

  @Prop()
  totalLineNum: number;

  @Prop()
  translatedLineNum: number;

  @Prop()
  consistentLineNum: number;

  @Prop()
  parent: Types.ObjectId;
}

export const DocTreeSchema = SchemaFactory.createForClass(DocTree);
