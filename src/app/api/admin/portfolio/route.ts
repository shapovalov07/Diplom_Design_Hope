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
    await requireAdmin()
    const items = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        publishedBy: {
          select: { id: true, fullName: true, email: true },
        },
      },
    })
    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin()

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

    const published = Boolean(isPublished)

    const item = await prisma.portfolioItem.create({
      data: {
        title: title.trim(),
        projectUrl: projectUrl.trim(),
        description: description ?? null,
        coverImageUrl: coverImageUrl ?? null,
        isPublished: published,
        publishedById: published ? admin.id : null,
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
