import { Logger } from '@nestjs/common';

const logger = new Logger('dochub');

function logExeca<T>(res: T, { showStdout }: { showStdout?: boolean } = {}) {
  const tempRes: any = res || {};

  logger.log('execa', {
    command: tempRes.command,
    exitCode: tempRes.exitCode,
    stdout: showStdout !== false ? tempRes.stdout : '...',
    stderr: tempRes.stderr,
  });

  return res;
}

export default logger;
export { logExeca };
