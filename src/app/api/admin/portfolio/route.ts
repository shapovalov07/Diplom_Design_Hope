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

export async function GET() {
  try {
    await requireApiAdmin()
    const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:portfolio:create',
    limit: 80,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
    if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

    const body = await req.json().catch(() => null) as {
      title?: string
      projectUrl?: string
      description?: string | null
      coverImageUrl?: string | null
      isPublished?: boolean
    } | null
    if (!body) {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 })
    }

    const { title, projectUrl, description, coverImageUrl, isPublished } = body

    if (!title?.trim() || !projectUrl?.trim()) {
      return NextResponse.json({ error: 'title и projectUrl обязательны' }, { status: 400 })
    }
    if (title.trim().length > 160) {
      return NextResponse.json({ error: 'Слишком длинный title' }, { status: 400 })
    }

    if (!isHttpUrl(projectUrl.trim())) {
      return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
    }

    let safeCoverImageUrl: string | null = null
    if (coverImageUrl) {
      const value = String(coverImageUrl).trim()
      if (!isHttpUrl(value) && !isRelativeUploadPath(value)) {
        return NextResponse.json({ error: 'Некорректная ссылка (coverImageUrl)' }, { status: 400 })
      }
      safeCoverImageUrl = value
    }

    const safeDescription = description ? String(description).trim() : null
    if (safeDescription && safeDescription.length > 3000) {
      return NextResponse.json({ error: 'Слишком длинное описание' }, { status: 400 })
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title: title.trim(),
        projectUrl: projectUrl.trim(),
        description: safeDescription,
        coverImageUrl: safeCoverImageUrl,
        isPublished: Boolean(isPublished),
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
