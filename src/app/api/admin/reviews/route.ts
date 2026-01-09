import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export async function GET() {
  await requireAdmin()
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ reviews })
}
