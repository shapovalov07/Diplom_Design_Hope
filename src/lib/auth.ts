import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/src/lib/prisma'
import { SESSION_COOKIE_NAME } from '@/src/lib/security-constants'
import { verifySessionToken } from '@/src/lib/session'

type Session = { userId: string; role?: 'USER' | 'ADMIN'; sessionVersion: number } | null

async function readSession(): Promise<Session> {
  const jar = await cookies()
  const raw = jar.get(SESSION_COOKIE_NAME)?.value
  if (!raw) return null

  const parsed = await verifySessionToken(raw)
  if (!parsed) return null

  return { userId: parsed.userId, role: parsed.role, sessionVersion: parsed.sessionVersion }
}

export async function getCurrentUser() {
  const session = await readSession()
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      lastName: true,
      firstName: true,
      middleName: true,
      email: true,
      role: true,
      sessionVersion: true,
    },
  })

  if (!user || user.sessionVersion !== session.sessionVersion) {
    return null
  }

  const { sessionVersion: _sessionVersion, ...safeUser } = user
  return safeUser
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

export class ApiAuthError extends Error {
  constructor(message = 'UNAUTHORIZED') {
    super(message)
    this.name = 'ApiAuthError'
  }
}

export async function requireApiUser() {
  const user = await getCurrentUser()
  if (!user) throw new ApiAuthError()
  return user
}

export async function requireApiAdmin() {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') throw new ApiAuthError()
  return user
}
