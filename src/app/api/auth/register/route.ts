import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const fullName = String(body?.fullName || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) {
    return NextResponse.json({ error: 'Почта уже зарегистрирована' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: { fullName, email, passwordHash },
    select: { id: true, fullName: true, email: true, role: true },
  })

  return NextResponse.json({ user }, { status: 201 })
}
