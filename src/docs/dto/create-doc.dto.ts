export class CreateDocDto {
  readonly path: string;
  readonly name?: string;
  readonly desc?: string;
  readonly lang?: string;
  readonly logoUrl?: string;
  readonly docUrl?: string;
  readonly fromLineNum?: number;
  readonly toLineNum?: number;
  readonly consistentLineNum?: number;
  readonly fromOwner?: string;
  readonly fromRepo?: string;
  readonly fromBranch?: string;
  readonly fromPath?: string;
  readonly fromOriginalRev?: string;
  readonly fromModifiedRev?: string;
  readonly fromOriginalContent?: string;
  readonly fromModifiedContent?: string;
  readonly toOwner?: string;
  readonly toRepo?: string;
  readonly toBranch?: string;
  readonly toPath?: string;
  readonly toOriginalRev?: string;
  readonly toModifiedRev?: string;
  readonly toOriginalContent?: string;
  readonly toModifiedContent?: string;
}
