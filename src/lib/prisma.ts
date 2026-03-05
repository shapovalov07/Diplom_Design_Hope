
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  pool?: pg.Pool
}

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV !== 'production'
    ? 'postgresql://postgres:postgres@localhost:5432/diplom_design_hope'
    : undefined)

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

function readPositiveIntFromEnv(name: string, fallback: number) {
  const raw = process.env[name]
  if (!raw) return fallback

  const parsed = Number.parseInt(raw, 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback

  return parsed
}

const poolConnectTimeoutMs = readPositiveIntFromEnv('PG_CONNECT_TIMEOUT_MS', 5000)
const poolIdleTimeoutMs = readPositiveIntFromEnv('PG_IDLE_TIMEOUT_MS', 30000)
const poolQueryTimeoutMs = readPositiveIntFromEnv('PG_QUERY_TIMEOUT_MS', 15000)
const poolMaxConnections = readPositiveIntFromEnv('PG_POOL_MAX', 10)

let prisma: PrismaClient

if (!connectionString) {
  if (isBuild) {
    // Avoid failing Next.js build when DATABASE_URL is only available at runtime.
    prisma = new Proxy({} as PrismaClient, {
      get() {
        throw new Error('DATABASE_URL is missing')
      },
    })
  } else {
    throw new Error('DATABASE_URL is missing')
  }
} else {
  const pool =
    globalForPrisma.pool ??
    new Pool({
      connectionString,
      connectionTimeoutMillis: poolConnectTimeoutMs,
      idleTimeoutMillis: poolIdleTimeoutMs,
      query_timeout: poolQueryTimeoutMs,
      statement_timeout: poolQueryTimeoutMs,
      max: poolMaxConnections,
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool)

  prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
      adapter,
    })

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
}

export { prisma }
