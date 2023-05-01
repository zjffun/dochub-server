import { Types } from 'mongoose';

export default class Relation {
  _id: Types.ObjectId;
  fromRange: [number, number];
  toRange: [number, number];

  constructor({
    fromRange,
    toRange,
    _id,
  }: {
    fromRange: [number, number];
    toRange: [number, number];
    _id?: Types.ObjectId;
  }) {
    this.fromRange = fromRange;
    this.toRange = toRange;

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
    };
  }
}
