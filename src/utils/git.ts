import getGitWorkingDirectory from './getGitWorkingDirectory';
import { logExeca } from './logger';

async function parseRev({
  owner,
  repo,
  revision,
}: {
  owner: string;
  repo: string;
  revision: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });

  const res = logExeca(
    await execa('git', ['rev-parse', revision], {
      cwd: gitWorkingDirectory,
    }),
  );

  return res.stdout;
}

async function show({
  owner,
  repo,
  revision,
  filePath,
}: {
  owner: string;
  repo: string;
  revision: string;
  filePath: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });

  const res = logExeca(
    await execa('git', ['show', `${revision}:${filePath}`], {
      cwd: gitWorkingDirectory,
    }),
    {
      showStdout: false,
    },
  );

  return res.stdout;
}

async function getRevBefore({
  owner,
  repo,
  branch,
  date,
}: {
  owner: string;
  repo: string;
  branch: string;
  date: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });

  const res = logExeca(
    await execa(
      'git',
      ['log', branch, '-1', '--pretty=format:%H', '--before', date],
      {
        cwd: gitWorkingDirectory,
      },
    ),
  );

  return res.stdout;
}

async function getFileDate({
  owner,
  repo,
  revision,
  filePath,
}: {
  owner: string;
  repo: string;
  revision: string;
  filePath: string;
}) {
  const { execa } = await import('execa');

  const gitWorkingDirectory = getGitWorkingDirectory({
    owner,
    repo,
  });

  const res = logExeca(
    await execa(
      'git',
      ['log', revision, '-1', '--pretty=format:%cI', '--', filePath],
      {
        cwd: gitWorkingDirectory,
      },
    ),
  );

  return res.stdout;
}

export { parseRev, show, getFileDate, getRevBefore };
