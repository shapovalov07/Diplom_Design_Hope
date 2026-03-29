'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'
import { COOKIE_CONSENT_GRANTED_EVENT, hasCookieConsent } from '@/src/lib/cookie-consent'

const COUNTER_ID = 108296471;

declare global {
  interface Window {
    ym?: (...args: unknown[]) => void;
  }
}

export default function YandexMetrika() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [enabled, setEnabled] = useState(false)
  const mountedRef = useRef(false)
  const previousUrlRef = useRef<string | null>(null)
  const search = searchParams.toString()

  useEffect(() => {
    setEnabled(hasCookieConsent())

    function handleConsentGranted() {
      setEnabled(true)
    }

    window.addEventListener(COOKIE_CONSENT_GRANTED_EVENT, handleConsentGranted)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_GRANTED_EVENT, handleConsentGranted)
    }
  }, [])

  useEffect(() => {
    if (!enabled) return

    const currentUrl = window.location.href
    const referer = previousUrlRef.current ?? document.referrer

    if (mountedRef.current && typeof window.ym === "function") {
      window.ym(COUNTER_ID, 'hit', currentUrl, { referer })
    }

    previousUrlRef.current = currentUrl
    mountedRef.current = true
  }, [enabled, pathname, search])

  if (!enabled) return null

  return (
    <Script id="yandex-metrika" strategy="afterInteractive">
      {`(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=108296471', 'ym');

ym(108296471, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`}
    </Script>
  )
}
