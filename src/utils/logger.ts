import * as loglevel from 'loglevel';
import * as prefix from 'loglevel-plugin-prefix';

loglevel.setDefaultLevel('info');

const logger = loglevel.getLogger('dochub');

prefix.reg(loglevel);

prefix.apply(logger, {
  levelFormatter(level) {
    return level.toUpperCase();
  },
  nameFormatter(name) {
    return name || 'dochub';
  },
  timestampFormatter(date) {
    return date.toISOString();
  },
});

function logExeca<T>(res: T, { showStdout }: { showStdout?: boolean } = {}) {
  const tempRes: any = res || {};

  logger.info('execa', {
    command: tempRes.command,
    exitCode: tempRes.exitCode,
    stdout: showStdout !== false ? tempRes.stdout : '...',
    stderr: tempRes.stderr,
  });

  return res;
}

export default logger;
export { logExeca };
