import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RelationsDocument = HydratedDocument<Relation>;

@Schema({
  collection: 'relations',
})
export class Relation {
  @Prop()
  nameId: string;

  @Prop()
  fromPath: string;

  @Prop()
  toPath: string;

  @Prop()
  fromRange: [number, number];

  @Prop()
  toRange: [number, number];

  @Prop()
  state: string;

  @Prop()
  fromGitRev: string;

  @Prop()
  toGitRev: string;

  @Prop()
  fromGitWorkingDirectory: string;

  @Prop()
  toGitWorkingDirectory: string;
}

export const RelationSchema = SchemaFactory.createForClass(Relation);
