export interface IProjectDto {
  readonly path?: string;
  readonly name?: string;
  readonly desc?: string;
  readonly lang?: string;
  readonly logoUrl?: string;
  readonly docUrl?: string;
  readonly groupName?: string;

  // update
  readonly newPath?: string;
}
