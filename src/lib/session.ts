import { SignJWT, jwtVerify } from 'jose'
import { SESSION_MAX_AGE_SECONDS } from '@/src/lib/security-constants'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const secretValue = process.env.SESSION_SECRET

if (!secretValue && process.env.NODE_ENV === 'production' && !isBuild) {
  throw new Error('SESSION_SECRET is missing in production')
}

const secret = new TextEncoder().encode(
  secretValue || (isBuild ? 'build_secret_placeholder' : 'dev_secret_change_me'),
)

const secret = new TextEncoder().encode(rawSecret)
const IS_PRODUCTION = process.env.NODE_ENV === 'production'
const SESSION_ISSUER = 'hope-auth'
const SESSION_AUDIENCE = 'hope-web'

type SessionRole = 'USER' | 'ADMIN'

export type SessionPayload = {
  userId: string
  role: SessionRole
  iat: number
  exp: number
}

export async function createSessionToken(payload: { userId: string; role: SessionRole }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(SESSION_ISSUER)
    .setAudience(SESSION_AUDIENCE)
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secret)
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: SESSION_ISSUER,
      audience: SESSION_AUDIENCE,
    })

    if (typeof payload.userId !== 'string') return null
    if (payload.role !== 'USER' && payload.role !== 'ADMIN') return null
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null

    return payload as SessionPayload
  } catch {
    return null
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true as const,
    sameSite: 'strict' as const,
    path: '/',
    secure: IS_PRODUCTION,
    maxAge: SESSION_MAX_AGE_SECONDS,
  }
}
