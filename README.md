## Installation

```bash
$ npm install
```

### MongoDB Replica Set

`/opt/homebrew/etc/mongod.conf` add `replication`:

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

Restart MongoDB:

```bash
brew services restart mongodb-community
```

Initiate:

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

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# PM2

Installation:

```bash
npm install pm2@latest -g
```

Start:

```bash
pm2 start dist/main.js --name dochub-server
```

Auto restart after system reboot:

```bash
pm2 startup systemd
pm2 save
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
