export default (path: string) => {
  const pathRegExp = new RegExp(`^${path}[^$]`);
  return pathRegExp;
};
