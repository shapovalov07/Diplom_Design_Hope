import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'

type Session = { userId: string; role?: string } | null

function parseSession(raw: string): Session {
  if (!raw) return null

  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw)
      if (parsed?.userId && typeof parsed.userId === 'string') {
        return { userId: parsed.userId, role: parsed.role }
      }
      return null
    } catch {
      return null
    }
  }

  return { userId: raw }
}

export async function GET() {
  const jar = await cookies()
  const raw = jar.get('session')?.value

  const session = raw ? parseSession(raw) : null
  if (!session) return NextResponse.json({ user: null })

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  return NextResponse.json({ user: user ?? null })
}
