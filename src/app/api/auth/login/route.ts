import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/src/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/src/lib/security-constants'
import {
  checkRateLimit,
  isValidEmail,
  rateLimitErrorResponse,
  setCsrfCookie,
} from '@/src/lib/security'
import { createSessionToken, getSessionCookieOptions } from '@/src/lib/session'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'auth:login',
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  const body = await req.json().catch(() => null)

  const emailRaw = String(body?.email ?? body?.identifier ?? '').trim()
  const email = emailRaw.toLowerCase()
  const password = String(body?.password || '')

  if (!emailRaw || !password) {
    return NextResponse.json({ error: 'Заполни email и пароль' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: 'Неверные данные для входа' }, { status: 401 })
  }

  const token = await createSessionToken({
    userId: user.id,
    role: user.role,
    sessionVersion: user.sessionVersion,
  })

  const res = NextResponse.json(
    { ok: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
  res.cookies.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions())
  setCsrfCookie(res)

  return res
}
