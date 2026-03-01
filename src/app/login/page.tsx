'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const canSubmit = identifier.trim().length > 0 && password.length > 0 && !loading

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    const normalizedIdentifier = identifier.trim()
    if (!normalizedIdentifier || !password) {
      setMsg('Заполни логин и пароль')
      return
    }

    setMsg(null)
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier: normalizedIdentifier, password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setMsg(data?.error || 'Ошибка входа')
        return
      }

      router.replace('/')
      router.refresh()
    } catch {
      setMsg('Ошибка сети. Попробуй еще раз')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold">Вход</h1>

        <form onSubmit={submit} className="mt-5 grid gap-3">
          <input
            value={identifier}
            onChange={(e) => {
              setIdentifier(e.target.value)
              if (msg) setMsg(null)
            }}
            placeholder="Email или ФИО"
            name="identifier"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="relative">
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (msg) setMsg(null)
              }}
              placeholder="Пароль"
              type={showPassword ? 'text' : 'password'}
              name="password"
              autoComplete="current-password"
              className="h-11 w-full rounded-2xl border border-black/15 px-4 pr-20 outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 transition hover:text-black"
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C5 20 1 12 1 12a21.84 21.84 0 0 1 5.06-6.12" />
                  <path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.86 21.86 0 0 1-3.16 4.36" />
                  <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {msg && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-900">
              {msg}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="h-11 rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Вхожу…' : 'Войти'}
          </button>

          <div className="mt-2 text-center text-sm text-neutral-600">
            Нет аккаунта?{' '}
            <Link
              href="/register"
              className="font-semibold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
            >
              Регистрация
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
