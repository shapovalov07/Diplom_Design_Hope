export const COOKIE_CONSENT_KEY = 'hope_cookie_consent'
export const COOKIE_CONSENT_GRANTED_EVENT = 'hope:cookie-consent-granted'

export function hasCookieConsent() {
  if (typeof document === 'undefined') return false

  return document.cookie.split('; ').some((item) => item.startsWith(`${COOKIE_CONSENT_KEY}=1`))
}

export function grantCookieConsent() {
  if (typeof document === 'undefined') return

  document.cookie = `${COOKIE_CONSENT_KEY}=1; path=/; max-age=31536000; samesite=lax`
  window.dispatchEvent(new Event(COOKIE_CONSENT_GRANTED_EVENT))
}
