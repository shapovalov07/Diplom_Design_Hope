# Server deploy

This project can run behind Nginx Proxy Manager using a shared external Docker network and an isolated internal application network.

## Files

- `docker-compose.server.yml`: production stack for the server
- `.env.server.example`: server environment template

## Expected topology

- `app` joins:
  - external network `proxy` for Nginx Proxy Manager
  - internal network `backend` for private traffic to PostgreSQL
- `db` joins only `backend`
- Nginx Proxy Manager should forward the domain to the container alias from `APP_NETWORK_ALIAS` on port `3000`

## First-time setup on the server

```bash
docker network create proxy || true
git clone https://github.com/shapovalov07/Diplom_Design_Hope.git
cd Diplom_Design_Hope
cp .env.server.example .env.server
mkdir -p storage/uploads storage/postgres
docker compose --env-file .env.server -f docker-compose.server.yml up -d --build
```

## Updates from git

```bash
cd Diplom_Design_Hope
git pull
docker compose --env-file .env.server -f docker-compose.server.yml up -d --build
```

## Nginx Proxy Manager

- Scheme: `http`
- Forward Hostname / IP: value of `APP_NETWORK_ALIAS` from `.env.server`
- Forward Port: `3000`
- The proxy host itself must also be attached to the external Docker network `proxy`
