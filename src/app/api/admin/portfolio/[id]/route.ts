import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await requireAdmin()
  const { id } = await ctx.params
  const body = await req.json()

  const data: any = {}
  let current: { isPublished: boolean; publishedById: string | null } | null = null

  if (body.title !== undefined) data.title = String(body.title).trim()
  if (body.projectUrl !== undefined) {
    const url = String(body.projectUrl).trim()
    try { new URL(url) } catch {
      return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
    }
    data.projectUrl = url
  }
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null
  if (body.coverImageUrl !== undefined) data.coverImageUrl = body.coverImageUrl ? String(body.coverImageUrl) : null
  if (body.isPublished !== undefined) {
    const nextPublished = Boolean(body.isPublished)
    data.isPublished = nextPublished

    current = await prisma.portfolioItem.findUnique({
      where: { id },
      select: { isPublished: true, publishedById: true },
    })

    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (!nextPublished) {
      data.publishedById = null
    } else if (!current.isPublished || !current.publishedById) {
      data.publishedById = admin.id
    }
  }

  const item = await prisma.portfolioItem.update({ where: { id }, data })
  return NextResponse.json({ item })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  await requireAdmin()
  const { id } = await ctx.params
  await prisma.portfolioItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
