#!/bin/sh
set -eu

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-diplom_design_hope}"
POSTGRES_HOST="${POSTGRES_HOST:-127.0.0.1}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_LISTEN_ADDRESSES="${POSTGRES_LISTEN_ADDRESSES:-0.0.0.0}"
PGDATA="${PGDATA:-/var/lib/postgresql/data}"
PG_BIN_DIR="${PG_BIN_DIR:-$(dirname "$(find /usr/lib/postgresql -mindepth 2 -maxdepth 3 -type f -name postgres | sort | tail -n 1)")}"

if [ -z "${PG_BIN_DIR}" ] || [ ! -x "${PG_BIN_DIR}/postgres" ]; then
  echo "[entrypoint] PostgreSQL binaries not found"
  exit 1
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}}"
export PGPASSWORD="${POSTGRES_PASSWORD}"

mkdir -p "${PGDATA}" /var/run/postgresql /app/public/uploads
chown -R postgres:postgres "${PGDATA}" /var/run/postgresql
chmod 700 "${PGDATA}"

if [ ! -s "${PGDATA}/PG_VERSION" ]; then
  echo "[entrypoint] Initializing PostgreSQL cluster..."
  pwfile="$(mktemp)"
  printf '%s' "${POSTGRES_PASSWORD}" > "${pwfile}"
  chown postgres:postgres "${pwfile}"
  su -s /bin/sh postgres -c "${PG_BIN_DIR}/initdb -D '${PGDATA}' --username='${POSTGRES_USER}' --pwfile='${pwfile}'"
  rm -f "${pwfile}"
fi

cleanup() {
  echo "[entrypoint] Stopping PostgreSQL..."
  su -s /bin/sh postgres -c "${PG_BIN_DIR}/pg_ctl -D '${PGDATA}' -m fast -w stop" >/dev/null 2>&1 || true
}

trap cleanup EXIT INT TERM

echo "[entrypoint] Starting PostgreSQL..."
su -s /bin/sh postgres -c "${PG_BIN_DIR}/pg_ctl -D '${PGDATA}' -o \"-c listen_addresses='${POSTGRES_LISTEN_ADDRESSES}' -c port=${POSTGRES_PORT}\" -w start"

echo "[entrypoint] Ensuring database exists..."
if [ "$(psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'")" != "1" ]; then
  psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres -c "CREATE DATABASE \"${POSTGRES_DB}\";"
fi

echo "[entrypoint] Running Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Seeding admin user..."
node prisma/seed.mjs

echo "[entrypoint] Starting application..."
"$@" &
app_pid=$!
wait "${app_pid}"
