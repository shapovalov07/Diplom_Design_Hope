import { cookies } from 'next/headers'
import { verifySessionToken } from '@/src/lib/session'
import { prisma } from '@/src/lib/prisma'

export async function getCurrentUser() {
  const token = (await cookies()).get('session')?.value
  if (!token) return null

  try {
    const payload = await verifySessionToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, fullName: true, email: true, role: true },
    })
    return user
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHORIZED')
  return user
}

export async function requireAdmin() {
  const user = await requireUser()
  if (user.role !== 'ADMIN') throw new Error('FORBIDDEN')
  return user
}
