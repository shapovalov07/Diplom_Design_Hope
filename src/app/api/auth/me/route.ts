import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'
import { verifySessionToken } from '@/src/lib/session'

export const runtime = 'nodejs'

export async function GET() {
  const jar = await cookies()
  const raw = jar.get('session')?.value

  if (!raw) return NextResponse.json({ user: null })

  let userId: string
  try {
    const payload = await verifySessionToken(raw)
    userId = String(payload.userId)
  } catch {
    return NextResponse.json({ user: null })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  return NextResponse.json({ user: user ?? null })
}
