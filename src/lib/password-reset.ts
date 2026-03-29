import { createHash, randomBytes } from 'crypto'

export const PASSWORD_RESET_TOKEN_TTL_MINUTES = 30
const PASSWORD_RESET_TOKEN_TTL_MS = PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000

export function createPasswordResetToken() {
  return randomBytes(32).toString('base64url')
}

export function hashPasswordResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function getPasswordResetExpiresAt(now = Date.now()) {
  return new Date(now + PASSWORD_RESET_TOKEN_TTL_MS)
}

export function getAppBaseUrl(request: Request) {
  const configured = process.env.APP_BASE_URL?.trim()
  if (configured) {
    return configured.replace(/\/+$/, '')
  }

  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim()

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

export function buildPasswordResetUrl(request: Request, token: string) {
  return `${getAppBaseUrl(request)}/reset-password?token=${encodeURIComponent(token)}`
}
