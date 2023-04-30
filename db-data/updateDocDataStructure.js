db.docs.find().forEach(function (item) {
  const entries = Object.entries({
    fromOwner: 'originalOwner',
    fromRepo: 'originalRepo',
    fromBranch: 'originalBranch',
    fromPath: 'originalPath',
    toOwner: 'translatedOwner',
    toRepo: 'translatedRepo',
    toBranch: 'translatedBranch',
    toPath: 'translatedPath',
    fromModifiedRev: 'originalRev',
    fromModifiedContentSha: 'originalContentSha',
    toModifiedRev: 'translatedRev',
    toModifiedContentSha: 'translatedContentSha',
  });

  const relation = db.relations.findOne({ docObjectId: item._id });

  if (relation) {
    if (relation.fromContentSha) {
      db.docs.updateOne(
        { _id: item._id },
        {
          $set: {
            fromOriginalRev: '',
            fromOriginalContentSha: relation.fromContentSha,
          },
        },
      );
      db.relations.updateOne(
        { _id: relation._id },
        {
          $unset: {
            fromContentSha: true,
          },
        },
      );
    }

    if (relation.toContentSha) {
      db.docs.updateOne(
        { _id: item._id },
        {
          $set: {
            toOriginalRev: '',
            toOriginalContentSha: relation.toContentSha,
          },
        },
      );
      db.relations.updateOne(
        { _id: relation._id },
        {
          $unset: {
            toContentSha: true,
          },
        },
      );
    }
  }

  for (const [name1, name2] of entries) {
    if (item[name2]) {
      db.docs.updateOne(
        { _id: item._id },
        {
          $set: {
            [name1]: item[name2],
          },
          $unset: {
            [name2]: true,
          },
        },
      );
    }
  }
});
