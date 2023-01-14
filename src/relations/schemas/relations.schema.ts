import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RelationsDocument = HydratedDocument<Relation>;

@Schema({
  collection: 'relations',
})
export class Relation {
  @Prop()
  fromRev: string;

  @Prop()
  fromPath: string;

  @Prop()
  fromBaseDir: string;

  @Prop()
  fromRange: [number, number];

  @Prop()
  toRev: string;

  @Prop()
  toPath: string;

  @Prop()
  toBaseDir: string;

  @Prop()
  toRange: [number, number];

  @Prop()
  nameId: string;
}

export const RelationSchema = SchemaFactory.createForClass(Relation);
