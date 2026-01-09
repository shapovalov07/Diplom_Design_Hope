import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(req: Request, ctx: Ctx) {
  await requireAdmin()

  const { id } = await ctx.params
  const { isApproved } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const review = await prisma.review.update({
    where: { id },
    data: { isApproved: Boolean(isApproved) },
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
