import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

const connectionString =
  process.env.DATABASE_URL ||
  (process.env.NODE_ENV !== 'production'
    ? 'postgresql://postgres:postgres@localhost:5432/diplom_design_hope'
    : undefined)

if (!connectionString) {
  throw new Error('DATABASE_URL is missing')
}

const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'admin@test.com'
  const password = 'admin12345'

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.user.upsert({
    where: { email },
    update: { role: 'ADMIN' },
    create: {
      fullName: 'Admin',
      email,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin created:')
  console.log('email:', email)
  console.log('password:', password)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
