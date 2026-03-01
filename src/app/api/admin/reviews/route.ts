import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { ApiAuthError, requireApiAdmin } from '@/src/lib/auth'

export const runtime = 'nodejs'

export async function GET() {
  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}
