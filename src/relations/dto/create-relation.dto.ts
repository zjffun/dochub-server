export class CreateRelationDto {
  readonly docPath: string;
  readonly fromRange: [number, number];
  readonly fromContentSha: string;
  readonly toRange: [number, number];
  readonly toContentSha: string;
  readonly state: string;
}
