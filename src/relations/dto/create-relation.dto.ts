export class CreateRelationDto {
  readonly nameId: string;
  readonly fromPath: string;
  readonly toPath: string;
  readonly fromRange: [number, number];
  readonly toRange: [number, number];
  readonly state: string;

  readonly fromGitRev: string;
  readonly toGitRev: string;
  readonly fromGitWorkingDirectory: string;
  readonly toGitWorkingDirectory: string;
}
