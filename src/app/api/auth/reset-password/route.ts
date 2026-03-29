import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { hashPasswordResetToken } from '@/src/lib/password-reset'
import {
  checkRateLimit,
  getPasswordValidationError,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'auth:reset-password',
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  const body = await req.json().catch(() => null)
  const token = String(body?.token ?? '').trim()
  const password = String(body?.password ?? '')

  if (!token || !password) {
    return NextResponse.json({ error: 'Нужны токен и новый пароль' }, { status: 400 })
  }

  const passwordError = getPasswordValidationError(password)
  if (passwordError) {
    return NextResponse.json({ error: passwordError }, { status: 400 })
  }

  const tokenHash = hashPasswordResetToken(token)
  const now = new Date()

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt <= now) {
    return NextResponse.json({ error: 'Ссылка недействительна или уже истекла' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  try {
    await prisma.$transaction(async (tx) => {
      const marked = await tx.passwordResetToken.updateMany({
        where: {
          id: resetToken.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      })

      if (marked.count !== 1) {
        throw new Error('TOKEN_ALREADY_USED')
      }

      await tx.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          sessionVersion: { increment: 1 },
        },
      })

      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          id: { not: resetToken.id },
        },
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'TOKEN_ALREADY_USED') {
      return NextResponse.json({ error: 'Ссылка недействительна или уже истекла' }, { status: 400 })
    }

    console.error('[reset-password] failed to update password', error)
    return NextResponse.json({ error: 'Не удалось обновить пароль' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
