import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/src/lib/prisma'
import { createSessionToken } from '@/src/lib/session'

export async function POST(req: Request) {

const SECRET = process.env.SESSION_SECRET
if (!SECRET) throw new Error('SESSION_SECRET is missing in .env')
const secret = new TextEncoder().encode(SECRET)

  const { identifier, password } = await req.json()

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { fullName: identifier }] },
  })

  if (!user) {
    return NextResponse.json({ error: 'Неверные данные' }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Неверные данные' }, { status: 401 })
  }

  const token = await createSessionToken({ userId: user.id, role: user.role })

  const res = NextResponse.json({
    user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
  })

  res.cookies.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
