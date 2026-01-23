import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { verifySessionToken } from '@/src/lib/session'

type Session = { userId: string; role?: 'USER' | 'ADMIN' } | null

async function readSession(): Promise<Session> {
  // Next 16: cookies() async
  const jar = await cookies()
  const raw = jar.get('session')?.value
  if (!raw) return null

  try {
    const payload = await verifySessionToken(raw)
    const role =
      payload.role === 'ADMIN' || payload.role === 'USER' ? (payload.role as 'ADMIN' | 'USER') : undefined
    return { userId: String(payload.userId), role }
  } catch {
    return null
  }
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
