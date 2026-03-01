import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'
import { prisma } from '@/src/lib/prisma'
import {
  checkRateLimit,
  isValidEmail,
  normalizeEmail,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'auth:register',
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  const body = await req.json().catch(() => null)
  const fullName = String(body?.fullName ?? '').trim()
  const email = normalizeEmail(body?.email)
  const password = String(body?.password ?? '')

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: 'Заполните все поля' }, { status: 400 })
  }

  if (fullName.length < 2 || fullName.length > 120) {
    return NextResponse.json({ error: 'Некорректное имя' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
  }

  if (password.length < 10 || password.length > 128) {
    return NextResponse.json(
      { error: 'Пароль должен быть от 10 до 128 символов' },
      { status: 400 },
    )
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
