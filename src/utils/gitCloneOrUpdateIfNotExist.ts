import * as fse from 'fs-extra';
import getGitWorkingDirectory from './getGitWorkingDirectory';
import logger, { logExeca } from './logger';

async function getDefaultBranch({ gitWorkingDirectory }) {
  const { execa } = await import('execa');

  const res = logExeca(
    await execa('git', ['remote', 'show', 'origin'], {
      cwd: gitWorkingDirectory,
    }),
  );
  const branch = res.stdout.match(/HEAD branch: (.*)/)[1];

  return branch;
}

export default async function gitCloneOrUpdateIfNotExist({
  owner,
  repo,
  branch: branchParam,
}: {
  owner: string;
  repo: string;
  branch: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });
  const gitRepoUrl = `https://github.com/${owner}/${repo}.git`;

  logger.log('gitCloneOrUpdateIfNotExist', {
    gitWorkingDirectory,
    gitRepoUrl,
  });

  let branch = branchParam;

  fse.ensureDirSync(gitWorkingDirectory);

  logExeca(
    await execa('git', ['init', '--bare'], {
      cwd: gitWorkingDirectory,
    }),
  );

  try {
    logExeca(
      await execa('git', ['remote', 'add', 'origin', gitRepoUrl], {
        cwd: gitWorkingDirectory,
      }),
    );
  } catch (error) {
    logExeca(error);
  }

  if (!branch) {
    branch = await getDefaultBranch({
      gitWorkingDirectory,
    });
  }

  logExeca(
    await execa('git', ['fetch', 'origin', `${branch}:${branch}`], {
      cwd: gitWorkingDirectory,
    }),
  );

  return {
    branch,
  };
}
