import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const identifier = String(body?.identifier || '').trim()
  const password = String(body?.password || '').trim()

  if (!identifier || !password) {
    return NextResponse.json({ error: 'Заполни данные' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { fullName: identifier }] },
  })

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', JSON.stringify({ userId: user.id, role: user.role }), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: false, // localhost
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
