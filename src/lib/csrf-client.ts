const CSRF_COOKIE_NAME = 'csrf_token'

function readCookie(name: string) {
  if (typeof document === 'undefined') return null

  const prefix = `${name}=`
  const cookie = document.cookie.split('; ').find((part) => part.startsWith(prefix))
  if (!cookie) return null

  return decodeURIComponent(cookie.slice(prefix.length))
}

export function withCsrfHeaders(headers?: HeadersInit) {
  const result = new Headers(headers ?? {})
  const csrfToken = readCookie(CSRF_COOKIE_NAME)
  if (csrfToken) {
    result.set('x-csrf-token', csrfToken)
  }

  return result
}
