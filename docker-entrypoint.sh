#!/bin/sh
set -e

echo "[entrypoint] Running Prisma migrations..."
npx prisma migrate deploy

echo "[entrypoint] Seeding admin user..."
node prisma/seed.mjs

echo "[entrypoint] Starting Next.js..."
exec npm start
