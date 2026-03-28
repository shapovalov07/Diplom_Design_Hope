import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { ApiAuthError, requireApiUser } from '@/src/lib/auth'
import { formatRating, isValidRating } from '@/src/lib/rating'
import { sendTelegramMessage } from '@/src/lib/telegram'
import { formatUserFullName } from '@/src/lib/user-name'
import {
  checkRateLimit,
  csrfErrorResponse,
  hasValidCsrfToken,
  isHttpUrl,
  isRelativeUploadPath,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs'

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'reviews:create',
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    const user = await requireApiUser()
    const authorName = formatUserFullName(user)
    if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()
    const body = await req.json().catch(() => null)
    const rating = Number(body?.rating)
    const text = String(body?.text ?? '').trim()
    const avatarRaw = body?.avatarUrl

    if (!isValidRating(rating) || text.length < 3 || text.length > 2000) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
    }

    let avatarUrl: string | null = null
    if (avatarRaw !== undefined && avatarRaw !== null && String(avatarRaw).trim()) {
      const value = String(avatarRaw).trim()
      if (!isHttpUrl(value) && !isRelativeUploadPath(value)) {
        return NextResponse.json({ error: 'Некорректный URL аватара' }, { status: 400 })
      }
      avatarUrl = value
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        authorName,
        avatarUrl,
        rating,
        text,
      },
    })

    await sendTelegramMessage(
      [
        '📝 Новый отзыв',
        `Автор: ${authorName}`,
        `Email: ${user.email}`,
        `Оценка: ${formatRating(rating)}/5`,
        `Текст: ${review.text}`,
        `ID: ${review.id}`,
      ].join('\n'),
    )

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
