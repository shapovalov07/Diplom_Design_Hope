import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

function shouldUseSecureCookies(req: Request) {
  if (process.env.NODE_ENV !== 'production') return false
  const proto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (proto) return proto === 'https'
  const host = req.headers.get('host') || ''
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('[::1]')) {
    return false
  }
  return true
}

export async function POST(req: Request) {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('session', '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: shouldUseSecureCookies(req),
    maxAge: 0,
  })
  return res
}
