export class CreateRelationDto {
  readonly docObjectId: string;
  readonly fromRange: [number, number];
  readonly toRange: [number, number];
  readonly state?: string;
}
