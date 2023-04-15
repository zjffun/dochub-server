import getMaxPathSize from './getMaxPathSize';
import getPathRegExp from './getPathRegExp';

export interface IRawCondition {
  path?: string;
  depth?: number;
  isDelete?: boolean;
}

export default ({ path, depth, isDelete }: IRawCondition) => {
  const condition: any = {};

  if (path !== undefined) {
    condition.path = getPathRegExp(path);
  }

  const maxPathSize = getMaxPathSize({ path, depth });
  if (maxPathSize !== undefined) {
    condition.depth = {
      $lt: maxPathSize,
    };
  }

  if (isDelete === true) {
    condition.isDelete = true;
  } else {
    condition.isDelete = {
      $ne: true,
    };
  }

  return condition;
};
