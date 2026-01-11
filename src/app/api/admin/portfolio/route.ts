import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export async function GET() {
  try {
    await requireAdmin()
    const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdmin()

    const body = await req.json() as {
      title?: string
      projectUrl?: string
      description?: string | null
      coverImageUrl?: string | null
      isPublished?: boolean
    }

    const { title, projectUrl, description, coverImageUrl, isPublished } = body

    if (!title || !projectUrl) {
      return NextResponse.json({ error: 'title и projectUrl обязательны' }, { status: 400 })
    }

    try {
      new URL(projectUrl)
    } catch {
      return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
    }

    const item = await prisma.portfolioItem.create({
      data: {
        title: title.trim(),
        projectUrl: projectUrl.trim(),
        description: description ?? null,
        coverImageUrl: coverImageUrl ?? null,
        isPublished: Boolean(isPublished),
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }
}
