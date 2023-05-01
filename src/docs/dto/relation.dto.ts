export interface IRelationDto {
  readonly docId?: string;
  readonly fromRange?: [number, number];
  readonly toRange?: [number, number];

  // update
  readonly id?: string;
}
