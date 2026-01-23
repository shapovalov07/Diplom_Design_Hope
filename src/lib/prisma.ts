
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

if (!connectionString) {
  throw new Error('DATABASE_URL is missing')
}

const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.pool = pool

const adapter = new PrismaPg(pool)

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
