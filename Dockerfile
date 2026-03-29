FROM node:20-bookworm-slim AS deps
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app

ENV DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/diplom_design_hope
ENV SESSION_SECRET=build_time_session_secret_at_least_32_chars

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PGDATA=/var/lib/postgresql/data

COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql \
  && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /var/lib/postgresql/data /var/run/postgresql /app/public/uploads \
  && chown -R postgres:postgres /var/lib/postgresql /var/run/postgresql \
  && chmod +x /app/docker-entrypoint.sh

EXPOSE 3000 5432 5555

ENTRYPOINT ["/app/docker-entrypoint.sh"]
CMD ["npm", "start"]
