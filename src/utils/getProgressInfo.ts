import Relation, { RelationState } from 'src/docs/utils/Relation';

export async function getProgressInfo(relations: Relation[]) {
  let totalLineNum = 0;
  let translatedLineNum = 0;
  let consistentLineNum = 0;

  for (const relation of relations) {
    const [fromStart, fromEnd] = relation.fromRange;
    const lineNum = fromEnd - fromStart + 1;
    totalLineNum += lineNum;

    if (relation.state !== RelationState.notTranslated) {
      translatedLineNum += lineNum;

      // TODO: fix
      consistentLineNum += lineNum;
    }
  }

  return {
    totalLineNum,
    translatedLineNum,
    consistentLineNum,
  };
}
