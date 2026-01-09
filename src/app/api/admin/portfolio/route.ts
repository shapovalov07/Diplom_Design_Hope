import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export async function GET() {
  await requireAdmin()
  const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  await requireAdmin()
  const { title, slug, description, content, coverImageUrl, tags, isPublished } = await req.json()

  if (!title || !slug) {
    return NextResponse.json({ error: 'title и slug обязательны' }, { status: 400 })
  }

  const item = await prisma.portfolioItem.create({
    data: {
      title: String(title).trim(),
      slug: String(slug).trim(),
      description: description ? String(description) : null,
      content: content ? String(content) : null,
      coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
      tags: Array.isArray(tags) ? tags.map(String) : [],
      isPublished: Boolean(isPublished),
    },
  })

  return NextResponse.json({ item }, { status: 201 })
}
