import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { ApiAuthError, requireApiAdmin } from '@/src/lib/auth'
import {
  checkRateLimit,
  csrfErrorResponse,
  hasValidCsrfToken,
  isHttpUrl,
  isRelativeUploadPath,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:reviews:patch',
    limit: 120,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
  if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

  const { id } = await ctx.params
  const body = await req.json().catch(() => null)

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const data: {
    isApproved?: boolean
    authorName?: string
    avatarUrl?: string | null
    rating?: number
    text?: string
  } = {}

  if (body?.isApproved !== undefined) {
    data.isApproved = Boolean(body.isApproved)
  }

  if (body?.authorName !== undefined) {
    const authorName = String(body.authorName).trim()
    if (!authorName || authorName.length > 120) {
      return NextResponse.json({ error: 'Некорректное имя автора' }, { status: 400 })
    }
    data.authorName = authorName
  }

  if (body?.avatarUrl !== undefined) {
    if (!body.avatarUrl) {
      data.avatarUrl = null
    } else {
      const avatar = String(body.avatarUrl).trim()
      if (!isHttpUrl(avatar) && !isRelativeUploadPath(avatar)) {
        return NextResponse.json({ error: 'Некорректный URL аватара' }, { status: 400 })
      }
      data.avatarUrl = avatar
    }
  }

  if (body?.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Некорректная оценка' }, { status: 400 })
    }
    data.rating = rating
  }

  if (body?.text !== undefined) {
    const text = String(body.text).trim()
    if (text.length < 3 || text.length > 2000) {
      return NextResponse.json({ error: 'Текст слишком короткий' }, { status: 400 })
    }
    data.text = text
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
  }

  const review = await prisma.review.update({
    where: { id },
    data,
  })

  return NextResponse.json({ review })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const rl = checkRateLimit(_req, {
    bucket: 'admin:reviews:delete',
    limit: 120,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
  if (!(await hasValidCsrfToken(_req))) return csrfErrorResponse()

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
