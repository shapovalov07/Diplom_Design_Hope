import { SignJWT, jwtVerify } from 'jose'

const isBuild = process.env.NEXT_PHASE === 'phase-production-build'
const secretValue = process.env.SESSION_SECRET

if (!secretValue && process.env.NODE_ENV === 'production' && !isBuild) {
  throw new Error('SESSION_SECRET is missing in production')
}

const secret = new TextEncoder().encode(
  secretValue || (isBuild ? 'build_secret_placeholder' : 'dev_secret_change_me'),
)

export async function createSessionToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret)
  return payload as { userId: string; role: string; iat: number; exp: number }
}
