```sh
mongodump --db relation
mongodump --uri "xxx" --db relation

mongorestore --db relation --drop docs.bson
mongorestore --db relation --drop relations.bson
mongorestore --db relation --drop contents.bson
```
