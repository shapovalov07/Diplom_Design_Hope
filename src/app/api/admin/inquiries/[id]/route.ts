import { NextResponse } from 'next/server'
import { InquiryStatus } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

const allowedStatuses = new Set<InquiryStatus>([
  InquiryStatus.NEW,
  InquiryStatus.IN_PROGRESS,
  InquiryStatus.DONE,
])

function isInquiryStatus(value: unknown): value is InquiryStatus {
  return typeof value === 'string' && allowedStatuses.has(value as InquiryStatus)
}

export async function PATCH(req: Request, ctx: Ctx) {
  await requireAdmin()

  const { id } = await ctx.params
  const { status } = await req.json()

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  if (!isInquiryStatus(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
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
