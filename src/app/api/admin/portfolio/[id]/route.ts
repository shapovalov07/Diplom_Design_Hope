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
    bucket: 'admin:portfolio:patch',
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
    title?: string
    projectUrl?: string
    description?: string | null
    coverImageUrl?: string | null
    isPublished?: boolean
  } = {}

  if (body?.title !== undefined) {
    const title = String(body.title).trim()
    if (!title || title.length > 160) {
      return NextResponse.json({ error: 'Некорректный title' }, { status: 400 })
    }
    data.title = title
  }
  if (body?.projectUrl !== undefined) {
    const url = String(body.projectUrl).trim()
    if (!isHttpUrl(url)) {
      return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
    }
    data.projectUrl = url
  }
  if (body?.description !== undefined) {
    const description = body.description ? String(body.description).trim() : null
    if (description && description.length > 3000) {
      return NextResponse.json({ error: 'Слишком длинное описание' }, { status: 400 })
    }
    data.description = description
  }
  if (body?.coverImageUrl !== undefined) {
    if (!body.coverImageUrl) {
      data.coverImageUrl = null
    } else {
      const value = String(body.coverImageUrl).trim()
      if (!isHttpUrl(value) && !isRelativeUploadPath(value)) {
        return NextResponse.json({ error: 'Некорректная ссылка (coverImageUrl)' }, { status: 400 })
      }
      data.coverImageUrl = value
    }
  }
  if (body?.isPublished !== undefined) data.isPublished = Boolean(body.isPublished)

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 })
  }

  const item = await prisma.portfolioItem.update({ where: { id }, data })
  return NextResponse.json({ item })
}

export async function DELETE(req: Request, ctx: Ctx) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:portfolio:delete',
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
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  await prisma.portfolioItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
