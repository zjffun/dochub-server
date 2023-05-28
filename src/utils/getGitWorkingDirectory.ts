import * as path from 'node:path';
import { dataPath } from 'src/config';

export default function getGitWorkingDirectory({
  owner,
  repo,
}: {
  owner: string;
  repo: string;
}) {
  const gitWorkingDirectory = path.join(dataPath, owner, repo);
  return gitWorkingDirectory;
}
