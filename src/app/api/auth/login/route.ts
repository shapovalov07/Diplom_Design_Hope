import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { createSessionToken } from '@/src/lib/session'
import bcrypt from 'bcryptjs'

export const runtime = 'nodejs'

function shouldUseSecureCookies(req: Request) {
  if (process.env.NODE_ENV !== 'production') return false
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (proto) return proto === 'https'
  const host = req.headers.get('host') || ''
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')) {
    return false
  }
  return true
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)

  const identifierRaw = String(body?.identifier || '').trim()
  const identifierEmail = identifierRaw.toLowerCase()
  const password = String(body?.password || '')

  if (!identifierRaw || !password) {
    return NextResponse.json({ error: 'Заполни данные' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifierEmail }, { fullName: identifierRaw }] },
  })

  if (!user) {
    return NextResponse.json({ error: 'Пользователь не найден' }, { status: 401 })
  }

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 })
  }

  const token = await createSessionToken({ userId: user.id, role: user.role })
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: shouldUseSecureCookies(req),
    maxAge: 60 * 60 * 24 * 7,
  })

  return res
}
