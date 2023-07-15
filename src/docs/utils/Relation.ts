import { Types } from 'mongoose';

export enum RelationState {
  notTranslated = 'notTranslated',
}

export default class Relation {
  _id: Types.ObjectId;
  fromRange: [number, number];
  toRange: [number, number];
  state?: RelationState;

  constructor({
    fromRange,
    toRange,
    state,
    _id,
  }: {
    fromRange: [number, number];
    toRange: [number, number];
    state?: RelationState;
    _id?: Types.ObjectId;
  }) {
    this.fromRange = fromRange;
    this.toRange = toRange;
    this.state = state;

    if (_id) {
      this._id = _id;
    } else {
      this._id = new Types.ObjectId();
    }
  }

  get id() {
    return this._id.toString();
  }

  toJSON() {
    return {
      id: this.id,
      fromRange: this.fromRange,
      toRange: this.toRange,
      state: this.state,
    };
  }
}
