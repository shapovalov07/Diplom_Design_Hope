# Server deploy

This project can run behind Nginx Proxy Manager using a shared external Docker network.

## Files

- `docker-compose.server.yml`: production stack for the server
- `.env.server.example`: server environment template

## Expected topology

- one container runs both PostgreSQL and the Next.js app
- the container joins the external network `proxy` for Nginx Proxy Manager
- PostgreSQL data is stored in `./storage/postgres`
- uploaded files are stored in `./storage/uploads`
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

Before the first start, edit `.env.server`:

- `SESSION_SECRET`: random secret at least 32 characters long
- `APP_BASE_URL`: public HTTPS address of the site, for example `https://design-hope.ru`
- `MAIL_FROM`: sender address for transactional emails
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: SMTP config if you want to send mail directly, for example through Gmail SMTP
- `RESEND_API_KEY`: alternative to SMTP if you prefer sending through Resend

Mail transport priority:

- if SMTP variables are filled, the app sends through SMTP
- otherwise, if `RESEND_API_KEY` is filled, the app sends through Resend
- if neither is configured, password reset emails will not be sent in production

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
