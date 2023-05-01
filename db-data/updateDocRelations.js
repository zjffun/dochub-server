db.docs.find().forEach(function (item) {
  const relations = db.relations.find({ docObjectId: item._id });

  const newRelations = [];
  relations.forEach((d) => {
    newRelations.push({
      _id: d._id,
      fromRange: [...d.fromRange],
      toRange: [...d.toRange],
    });
  });

  db.docs.updateOne(
    { _id: item._id },
    {
      $set: {
        relations: newRelations,
      },
    },
  );
});
