import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// const secret = new TextEncoder().encode(process.env.SESSION_SECRET || 'dev_secret_change_me')

const SECRET = process.env.SESSION_SECRET
if (!SECRET) throw new Error('SESSION_SECRET is missing in .env')
const secret = new TextEncoder().encode(SECRET)


async function verify(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: string; role: string }
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const token = req.cookies.get('session')?.value
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    try {
      const payload = await verify(token)
      if (payload.role !== 'ADMIN') return NextResponse.redirect(new URL('/', req.url))
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(req.nextUrl.pathname)}`, req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
