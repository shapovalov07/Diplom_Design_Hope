import bcrypt from 'bcrypt'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import pg from 'pg'

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
})

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
      lastName: '',
      firstName: 'Admin',
      middleName: '',
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
    await pool.end()
  })
