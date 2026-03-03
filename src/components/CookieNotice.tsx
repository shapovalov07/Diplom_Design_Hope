'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

const COOKIE_KEY = 'hope_cookie_consent'

function hasConsent() {
  return document.cookie.split('; ').some((item) => item.startsWith(`${COOKIE_KEY}=`))
}

function setConsent() {
  document.cookie = `${COOKIE_KEY}=1; path=/`
}

export default function CookieNotice() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!hasConsent()) {
      setOpen(true)
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  if (!mounted || !open) return null

  function handleClose() {
    setConsent()
    setVisible(false)
    window.setTimeout(() => setOpen(false), 200)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[min(92vw,420px)]">
      <div
        role="dialog"
        aria-live="polite"
        className={[
          'relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 shadow-[0_20px_60px_rgba(0,0,0,0.12)] transition duration-200',
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
        ].join(' ')}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
          <div className="grid gap-3">
            <h3 className="text-lg font-semibold text-[#252525]">Мы используем куки-файлы</h3>
            <p className="text-sm text-neutral-600">
              Это позволяет нам анализировать взаимодействие посетителей с сайтом и делать его лучше.
            </p>
          </div>

          <div className="relative hidden items-center justify-end sm:flex">
            <div className="relative h-24 w-24">
              <div className="absolute inset-0 rounded-full border-[6px] border-[#E7C5C5]" />
              <div className="absolute -top-2 right-2 h-9 w-9 rounded-full bg-white" />
              <div className="absolute top-4 right-8 h-3 w-3 rounded-full bg-[#E7C5C5]" />
              <div className="absolute top-9 right-3 h-2.5 w-2.5 rounded-full bg-[#E7C5C5]" />
              <div className="absolute top-12 right-10 h-3 w-3 rounded-full bg-[#E7C5C5]/70" />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full border border-[#B5292A] px-6 py-2 text-sm font-semibold text-[#B5292A] transition hover:bg-[#B5292A]/10"
          >
            Понятно
          </button>
          <Link
            href="/privacy"
            className="text-sm text-neutral-600 underline underline-offset-4 hover:text-black"
          >
            Узнать больше
          </Link>
        </div>
      </div>
    </div>
  )
}
