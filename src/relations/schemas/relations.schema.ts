import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RelationsDocument = HydratedDocument<Relation>;

@Schema({
  collection: 'relation',
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
}

export const RelationSchema = SchemaFactory.createForClass(Relation);
