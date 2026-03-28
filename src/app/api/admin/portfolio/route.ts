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

type CreatePortfolioBody = {
  title?: string
  projectUrl?: string
  description?: string | null
  coverImageUrl?: string | null
  isPublished?: boolean
}

export async function GET() {
  try {
    await requireApiAdmin()
    const items = await prisma.portfolioItem.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        publishedBy: {
          select: { id: true, lastName: true, firstName: true, middleName: true, email: true },
        },
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:portfolio:create',
    limit: 120,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  let admin: Awaited<ReturnType<typeof requireApiAdmin>>
  try {
    admin = await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }

  if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

  try {
    const body = (await req.json().catch(() => null)) as CreatePortfolioBody | null
    if (!body) {
      return NextResponse.json({ error: 'Некорректный JSON' }, { status: 400 })
    }

    const title = body.title?.trim() ?? ''
    const projectUrl = body.projectUrl?.trim() ?? ''
    const description = body.description?.trim() ?? null
    const coverImageUrl = body.coverImageUrl?.trim() ?? null
    const isPublished = Boolean(body.isPublished)

    if (!title || !projectUrl) {
      return NextResponse.json({ error: 'title и projectUrl обязательны' }, { status: 400 })
    }

    if (title.length > 160) {
      return NextResponse.json({ error: 'Слишком длинный title' }, { status: 400 })
    }

    if (!isHttpUrl(projectUrl)) {
      return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
    }

    if (
      coverImageUrl &&
      !isRelativeUploadPath(coverImageUrl) &&
      !isHttpUrl(coverImageUrl)
    ) {
      return NextResponse.json({ error: 'Некорректная ссылка обложки' }, { status: 400 })
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title,
        projectUrl,
        description,
        coverImageUrl,
        isPublished,
        publishedById: isPublished ? admin.id : null,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
