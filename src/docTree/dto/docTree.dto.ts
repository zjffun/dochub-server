export interface IDocTreeDto {
  readonly path?: string;
  readonly totalLineNum?: number;
  readonly translatedLineNum?: number;
  readonly consistentLineNum?: number;
  readonly parent?: string;
}
