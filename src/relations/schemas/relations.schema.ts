import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RelationsDocument = HydratedDocument<Relation>;

@Schema({
  collection: 'relations',
})
export class Relation {
  @Prop()
  docObjectId: Types.ObjectId;

  @Prop()
  fromRange: [number, number];

  @Prop()
  fromContentSha: string;

  @Prop()
  toRange: [number, number];

  @Prop()
  toContentSha: string;

  @Prop()
  state: string;
}

export const RelationSchema = SchemaFactory.createForClass(Relation);
