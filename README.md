# [DocHub](https://dochub.zjffun.com/)

A website to compare changes, translate and submit PR.

# Development

```bash
docker compose -f docker-compose.dev.yml up --build
```

Open: http://127.0.0.1:3001/

# Docker Deploy

```bash
sudo docker stop dochub-server
sudo docker remove dochub-server
sudo docker pull zjffun/dochub-server
sudo docker run -e DOTENV_KEY="dotenv://:key_1234@dotenv.org/vault/.env.vault?environment=production" -d --restart=always --name dochub-server -p 30001:30001 zjffun/dochub-server:latest
sudo docker logs dochub-server
```

NGINX config:

```bash
sudo cat <<'EOF' > /etc/nginx/sites-enabled/dochub-server-zjffun-com
server {
    server_name dochub-server.zjffun.com;
    listen 80;

    location / {
        proxy_pass http://localhost:30001;
    }
}
EOF
```

# API Spec

Restful with out `@Param` (only use `@Query`).

# Manual Deploy

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
