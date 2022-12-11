export class CreateRelationDto {
  readonly fromRev: string;
  readonly fromPath: string;
  readonly fromBaseDir: string;
  readonly fromRange: [number, number];
  readonly toRev: string;
  readonly toPath: string;
  readonly toBaseDir: string;
  readonly toRange: [number, number];
}
