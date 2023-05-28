import * as git from '../../utils/git';
import { IDocDto } from '../dto/doc.dto';

export default async function createDocDtoByLocalGit({
  fromOwner,
  fromRepo,
  fromBranch,
  fromFileName,
  toOwner,
  toRepo,
  toBranch,
  toFileName,
  docPath,
}: {
  fromOwner: string;
  fromRepo: string;
  fromBranch: string;
  fromFileName: string;
  toOwner: string;
  toRepo: string;
  toBranch: string;
  toFileName: string;
  docPath: string;
}) {
  const { getRelationRanges } = await import('relation2-core');

  const fromPath = `${docPath}/${fromFileName}`;
  const toPath = `${docPath}/${toFileName}`;

  const toOriginalRev = await git.parseRev({
    owner: toOwner,
    repo: toRepo,
    revision: toBranch,
  });

  const toOriginalContent = await git.show({
    owner: toOwner,
    repo: toRepo,
    revision: toOriginalRev,
    filePath: toFileName,
  });

  const fromModifiedRev = await git.parseRev({
    owner: fromOwner,
    repo: fromRepo,
    revision: fromBranch,
  });

  const fromModifiedContent = await git.show({
    owner: fromOwner,
    repo: fromRepo,
    revision: fromModifiedRev,
    filePath: fromFileName,
  });

  const toOriginalDate = await git.getFileDate({
    owner: toOwner,
    repo: toRepo,
    revision: toOriginalRev,
    filePath: toFileName,
  });

  const fromOriginalRev = await git.getRevBefore({
    owner: fromOwner,
    repo: fromRepo,
    branch: fromBranch,
    date: toOriginalDate,
  });

  const fromOriginalContent = await git.show({
    owner: fromOwner,
    repo: fromRepo,
    revision: fromOriginalRev,
    filePath: fromFileName,
  });

  const relations = await getRelationRanges(
    fromOriginalContent,
    toOriginalContent,
  );

  const docDto: IDocDto = {
    path: toPath,

    fromOwner,
    fromRepo,
    fromBranch,
    fromPath,

    fromOriginalRev,
    fromModifiedRev,
    fromOriginalContent,
    fromModifiedContent,

    toOwner,
    toRepo,
    toBranch,
    toPath,

    toOriginalRev,
    toOriginalContent,

    relations,
  };

  return docDto;
}
