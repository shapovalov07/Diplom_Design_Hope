import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'

type Session = { userId: string; role?: 'USER' | 'ADMIN' } | null

async function readSession(): Promise<Session> {
  // Next 16: cookies() async
  const jar = await cookies()
  const raw = jar.get('session')?.value
  if (!raw) return null

  // session хранится JSON-строкой
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

  // fallback: если вдруг там просто userId
  return { userId: raw }
}

export async function getCurrentUser() {
  const session = await readSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  return user ?? null
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  return user
}

export async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') redirect('/login')
  return user
}
