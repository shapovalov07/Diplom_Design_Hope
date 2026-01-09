import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'

export async function GET() {
  const reviews = await prisma.review.findMany({
    where: { isApproved: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { rating, text, avatarUrl } = await req.json()

    const r = Number(rating)
    if (!r || r < 1 || r > 5 || !text || String(text).trim().length < 3) {
      return NextResponse.json({ error: 'Некорректные данные' }, { status: 400 })
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        authorName: user.fullName,
        avatarUrl: avatarUrl || null,
        rating: r,
        text: String(text).trim(),
      },
    })

    return NextResponse.json({ review }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}
