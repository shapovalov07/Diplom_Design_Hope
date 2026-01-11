import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireAdmin } from '@/src/lib/auth'

export async function GET() {
  await requireAdmin()
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          fullName: true,
          email: true,
        },
      },
    },
  })

  return NextResponse.json({ inquiries })
}
