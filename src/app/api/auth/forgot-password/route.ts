import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { sendPasswordResetEmail } from '@/src/lib/mail'
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  getPasswordResetExpiresAt,
  hashPasswordResetToken,
} from '@/src/lib/password-reset'
import {
  checkRateLimit,
  isValidEmail,
  normalizeEmail,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'auth:forgot-password',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  const body = await req.json().catch(() => null)
  const email = normalizeEmail(body?.email)

  if (!email) {
    return NextResponse.json({ error: 'Укажите почту' }, { status: 400 })
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Некорректная почта' }, { status: 400 })
  }

  const genericResponse = {
    ok: true,
    message: 'Если аккаунт с такой почтой существует, ссылка на сброс уже отправлена.',
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, firstName: true },
  })

  if (!user) {
    return NextResponse.json(genericResponse)
  }

  const token = createPasswordResetToken()
  const tokenHash = hashPasswordResetToken(token)
  const expiresAt = getPasswordResetExpiresAt()
  const resetUrl = buildPasswordResetUrl(req, token)

  await prisma.passwordResetToken.deleteMany({
    where: {
      OR: [{ userId: user.id }, { expiresAt: { lt: new Date() } }, { usedAt: { not: null } }],
    },
  })

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  })

  try {
    const result = await sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      resetUrl,
    })

    return NextResponse.json({
      ...genericResponse,
      ...(result.previewUrl ? { previewUrl: result.previewUrl } : {}),
    })
  } catch (error) {
    await prisma.passwordResetToken.deleteMany({ where: { tokenHash } })
    console.error('[forgot-password] failed to deliver reset email', error)
    return NextResponse.json(genericResponse)
  }
}
