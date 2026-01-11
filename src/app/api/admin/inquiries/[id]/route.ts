import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

type Ctx = { params: Promise<{ id: string }> }

const allowedStatuses = new Set(['NEW', 'IN_PROGRESS', 'DONE'])

export async function PATCH(req: Request, ctx: Ctx) {
  await requireAdmin()

  const { id } = await ctx.params
  const { status } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  if (!allowedStatuses.has(String(status))) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status: String(status) },
  })

  return NextResponse.json({ inquiry })
}

export async function DELETE(_req: Request, ctx: Ctx) {
  await requireAdmin()

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.inquiry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
