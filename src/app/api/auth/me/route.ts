import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/src/lib/prisma'
import { CSRF_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/src/lib/security-constants'
import { setCsrfCookie } from '@/src/lib/security'
import { verifySessionToken } from '@/src/lib/session'

export async function GET() {
  const jar = await cookies()
  const raw = jar.get(SESSION_COOKIE_NAME)?.value

  const session = raw ? await verifySessionToken(raw) : null
  if (!session) {
    return NextResponse.json(
      { user: null },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  const response = NextResponse.json(
    { user: user ?? null },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )

  if (!jar.get(CSRF_COOKIE_NAME)?.value) {
    setCsrfCookie(response)
  }

  return response
}
