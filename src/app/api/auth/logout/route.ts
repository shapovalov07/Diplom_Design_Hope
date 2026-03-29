import { NextResponse } from 'next/server'
import { clearCsrfCookie } from '@/src/lib/security'
import { SESSION_COOKIE_NAME } from '@/src/lib/security-constants'
import { getSessionCookieOptions } from '@/src/lib/session'

export const runtime = 'nodejs'

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set(SESSION_COOKIE_NAME, '', {
    ...getSessionCookieOptions(),
    maxAge: 0,
  })
  clearCsrfCookie(response)

  return response
}
