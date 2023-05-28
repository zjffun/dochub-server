import getGitWorkingDirectory from './getGitWorkingDirectory';
import { logExeca } from './logger';
import { filter } from 'minimatch';

export default async function gitGetFilesNameByGlob({
  owner,
  repo,
  branch,
  glob,
}: {
  owner: string;
  repo: string;
  branch: string;
  glob: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });

  const res = logExeca(
    await execa('git', ['ls-tree', '--name-only', '-r', branch], {
      cwd: gitWorkingDirectory,
    }),
    {
      showStdout: false,
    },
  );

  const filesName = res.stdout.split('\n').filter(filter(glob));

  return filesName;
}
