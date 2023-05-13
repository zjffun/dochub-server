# Deploy

TODO: docker

## Clone and Install

```bash
git clone https://github.com/zjffun/dochub-server.git
yarn install
```

## MongoDB Replica Set

1 `/opt/homebrew/etc/mongod.conf` add `replication`:

```text
systemLog:
  destination: file
  path: /opt/homebrew/var/log/mongodb/mongo.log
  logAppend: true
storage:
  dbPath: /opt/homebrew/var/mongodb
net:
  bindIp: 127.0.0.1, ::1
  ipv6: true
replication:
  replSetName: replocal
```

2 Restart MongoDB:

```bash
brew services restart mongodb-community
```

3 Initiate:

```bash
mongosh
```

```js
db.grantRolesToUser('admin', [
  {
    role: 'clusterAdmin',
    db: 'admin',
  },
]);

rs.initiate();
```

## PM2

1 Installation:

```bash
npm install pm2@latest -g
```

2 Start:

```bash
pm2 start dist/main.js --name dochub-server
```

3 Auto restart after system reboot:

```bash
pm2 startup systemd
pm2 save
```

# Update Deploy (pull and restart)

```bash
yarn update
```

# Development

TODO

# Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# API Spec

Restful with out `@Param` (only use `@Query`).
