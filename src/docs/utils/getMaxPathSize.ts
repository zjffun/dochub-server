export default ({ path, depth }: { path?: string; depth?: number }) => {
  if (path === undefined) {
    return undefined;
  }
  if (depth === undefined) {
    return undefined;
  }
  return path.split('/').length - 1 + depth;
};
