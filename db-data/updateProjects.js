db.docs
  .find({
    depth: 1,
  })
  .forEach(function (item) {
    db.projects.insertOne(item);
  });
