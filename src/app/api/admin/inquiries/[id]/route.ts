import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { ApiAuthError, requireApiAdmin } from '@/src/lib/auth'
import { InquiryStatus } from '@prisma/client'
import {
  checkRateLimit,
  csrfErrorResponse,
  hasValidCsrfToken,
  rateLimitErrorResponse,
} from '@/src/lib/security'

type Ctx = { params: Promise<{ id: string }> }

const allowedStatuses = new Set<InquiryStatus>(['NEW', 'IN_PROGRESS', 'DONE'])

function isInquiryStatus(value: unknown): value is InquiryStatus {
  return typeof value === 'string' && allowedStatuses.has(value as InquiryStatus)
}

export async function PATCH(req: Request, ctx: Ctx) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:inquiries:patch',
    limit: 120,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
  if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

  const { id } = await ctx.params
  const body = await req.json().catch(() => null)
  const status = body?.status

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

export async function DELETE(req: Request, ctx: Ctx) {
  const rl = checkRateLimit(req, {
    bucket: 'admin:inquiries:delete',
    limit: 120,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
  if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

  const { id } = await ctx.params
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  await prisma.inquiry.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
