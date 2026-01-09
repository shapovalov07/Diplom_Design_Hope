import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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
