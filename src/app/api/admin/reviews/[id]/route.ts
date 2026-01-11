import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  await requireAdmin()

  const { id } = await ctx.params
  const body = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const data: any = {}

  if (body.isApproved !== undefined) {
    data.isApproved = Boolean(body.isApproved)
  }

  if (body.authorName !== undefined) {
    data.authorName = String(body.authorName).trim()
  }

  if (body.avatarUrl !== undefined) {
    data.avatarUrl = body.avatarUrl ? String(body.avatarUrl).trim() : null
  }

  if (body.rating !== undefined) {
    const rating = Number(body.rating)
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Некорректная оценка' }, { status: 400 })
    }
    data.rating = rating
  }

  if (body.text !== undefined) {
    const text = String(body.text).trim()
    if (text.length < 3) {
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
  await requireAdmin()

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.review.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
