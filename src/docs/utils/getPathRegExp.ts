export default (path: string) => {
  const pathRegExp = new RegExp(`^${path}${path.endsWith('/') ? '' : '/'}`);
  return pathRegExp;
};
