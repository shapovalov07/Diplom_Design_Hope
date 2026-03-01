import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from '@/src/lib/security-constants'
import { clearCsrfCookie, csrfErrorResponse, hasValidCsrfToken } from '@/src/lib/security'
import { getSessionCookieOptions, verifySessionToken } from '@/src/lib/session'

export async function POST(req: Request) {
  const jar = await cookies()
  const rawSession = jar.get(SESSION_COOKIE_NAME)?.value
  const session = rawSession ? await verifySessionToken(rawSession) : null
  if (session && !(await hasValidCsrfToken(req))) {
    return csrfErrorResponse()
  }

  const res = NextResponse.json(
    { ok: true },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )

  res.cookies.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
  clearCsrfCookie(res)

  return res
}
