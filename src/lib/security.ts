import { randomBytes, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { CSRF_COOKIE_NAME, CSRF_MAX_AGE_SECONDS } from '@/src/lib/security-constants'

const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const RATE_LIMIT_MAX_KEYS = 10_000

type RateLimitBucket = {
  count: number
  resetAt: number
}

const rateLimitBuckets = new Map<string, RateLimitBucket>()

export function createCsrfToken() {
  return randomBytes(32).toString('base64url')
}

export function setCsrfCookie(response: NextResponse, token = createCsrfToken()) {
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    secure: IS_PRODUCTION,
    maxAge: CSRF_MAX_AGE_SECONDS,
  })

  return token
}

export function clearCsrfCookie(response: NextResponse) {
  response.cookies.set(CSRF_COOKIE_NAME, '', {
    httpOnly: false,
    sameSite: 'strict',
    path: '/',
    secure: IS_PRODUCTION,
    maxAge: 0,
  })
}

export async function hasValidCsrfToken(request: Request) {
  const jar = await cookies()
  const cookieToken = jar.get(CSRF_COOKIE_NAME)?.value ?? ''
  const headerToken = request.headers.get('x-csrf-token') ?? ''

  if (!cookieToken || !headerToken) return false
  if (cookieToken.length !== headerToken.length) return false

  return timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
}

export function csrfErrorResponse() {
  return NextResponse.json({ error: 'CSRF token is invalid' }, { status: 403 })
}

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim()
    if (first) return first
  }

  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp

  return 'unknown'
}

function pruneRateLimitBuckets(now: number) {
  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_KEYS) return

  for (const [key, value] of rateLimitBuckets.entries()) {
    if (value.resetAt <= now) {
      rateLimitBuckets.delete(key)
    }
  }

  if (rateLimitBuckets.size <= RATE_LIMIT_MAX_KEYS) return

  let overflow = rateLimitBuckets.size - RATE_LIMIT_MAX_KEYS
  for (const key of rateLimitBuckets.keys()) {
    rateLimitBuckets.delete(key)
    overflow -= 1
    if (overflow <= 0) break
  }
}

export function checkRateLimit(
  request: Request,
  {
    bucket,
    limit,
    windowMs,
  }: {
    bucket: string
    limit: number
    windowMs: number
  },
) {
  const now = Date.now()
  const key = `${bucket}:${getClientIp(request)}`
  const existing = rateLimitBuckets.get(key)

  if (!existing || existing.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs })
    pruneRateLimitBuckets(now)
    return { limited: false, retryAfterSec: 0 }
  }

  existing.count += 1
  if (existing.count > limit) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  return { limited: false, retryAfterSec: 0 }
}

export function rateLimitErrorResponse(retryAfterSec: number) {
  return NextResponse.json(
    { error: 'Too many requests, please try later' },
    {
      status: 429,
      headers: {
        'Retry-After': String(retryAfterSec),
      },
    },
  )
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(raw: unknown) {
  return String(raw ?? '').trim().toLowerCase()
}

export function isValidEmail(email: string) {
  return email.length > 0 && email.length <= 254 && EMAIL_RE.test(email)
}

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isRelativeUploadPath(value: string) {
  return /^\/uploads\/[A-Za-z0-9-]+\.(png|jpg|jpeg|webp)$/i.test(value)
}
