import Relation from './Relation';

export default function getDocRes(doc, additionalData = {}) {
  return {
    ...doc.toJSON(),
    id: doc.id,
    relations: doc.relations.map((relation) => {
      return new Relation(relation);
    }),
    ...additionalData,
  };
}
