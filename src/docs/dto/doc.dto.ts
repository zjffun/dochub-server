import { IRelationDto } from './relation.dto';

export interface IDocDto {
  readonly path?: string;
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
  readonly fromOriginalContentSha?: string;
  readonly fromModifiedContent?: string;
  readonly fromModifiedContentSha?: string;
  readonly toOwner?: string;
  readonly toRepo?: string;
  readonly toBranch?: string;
  readonly toPath?: string;
  readonly toOriginalRev?: string;
  readonly toModifiedRev?: string;
  readonly toOriginalContent?: string;
  readonly toOriginalContentSha?: string;
  readonly toModifiedContent?: string;
  readonly toModifiedContentSha?: string;
  readonly toEditingContent?: string;
  readonly relations?: IRelationDto[];
  readonly pullNumber?: number;

  // update
  readonly newPath?: string;
}
