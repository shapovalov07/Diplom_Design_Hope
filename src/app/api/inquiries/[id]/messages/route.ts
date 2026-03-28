import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'

export const runtime = 'nodejs'

type Ctx = { params: Promise<{ id: string }> }

async function getInquiryOrError(id: string, user: { id: string; role: 'USER' | 'ADMIN' }) {
  if (!id) {
    return { error: NextResponse.json({ error: 'Missing id' }, { status: 400 }) }
  }

  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    select: { id: true, userId: true },
  })

  if (!inquiry) {
    return { error: NextResponse.json({ error: 'Not found' }, { status: 404 }) }
  }

  if (user.role !== 'ADMIN' && inquiry.userId !== user.id) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { inquiry }
}

export async function GET(_req: Request, ctx: Ctx) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }

  const { id } = await ctx.params
  const check = await getInquiryOrError(id, user)
  if (check.error) return check.error

  const messages = await prisma.inquiryMessage.findMany({
    where: { inquiryId: id },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      text: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          lastName: true,
          firstName: true,
          middleName: true,
          role: true,
        },
      },
    },
  })

  return NextResponse.json({ messages })
}

export async function POST(req: Request, ctx: Ctx) {
  let user
  try {
    user = await requireUser()
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }

  const { id } = await ctx.params
  const check = await getInquiryOrError(id, user)
  if (check.error) return check.error

  const body = await req.json().catch(() => ({}))
  const text = typeof body?.text === 'string' ? body.text.trim() : ''

  if (!text) {
    return NextResponse.json({ error: 'Введите сообщение' }, { status: 400 })
  }

  const message = await prisma.inquiryMessage.create({
    data: {
      inquiryId: id,
      authorId: user.id,
      text,
    },
    select: {
      id: true,
      text: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          lastName: true,
          firstName: true,
          middleName: true,
          role: true,
        },
      },
    },
  })

  return NextResponse.json({ message }, { status: 201 })
}
