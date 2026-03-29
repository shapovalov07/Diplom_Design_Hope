import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import {
  checkRateLimit,
  getPasswordValidationError,
  isValidEmail,
  normalizeEmail,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'auth:register',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  const body = await req.json().catch(() => null)
  const lastName = String(body?.lastName ?? '').trim()
  const firstName = String(body?.firstName ?? '').trim()
  const middleName = String(body?.middleName ?? '').trim()
  const email = normalizeEmail(body?.email)
  const password = String(body?.password ?? '')

  if (!lastName || !firstName || !email || !password) {
    return NextResponse.json({ error: 'Заполни фамилию, имя, почту и пароль' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Некорректная почта' }, { status: 400 })
  }

  const passwordError = getPasswordValidationError(password)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    return NextResponse.json({ error: 'Почта уже зарегистрирована' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      lastName,
      firstName,
      middleName,
      email,
      passwordHash,
    },
    select: {
      id: true,
      lastName: true,
      firstName: true,
      middleName: true,
      email: true,
      role: true,
    },
  })

  return NextResponse.json({ user }, { status: 201 })
}
