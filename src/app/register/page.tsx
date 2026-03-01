'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (loading) return

    setMsg(null)

    if (!fullName.trim() || !email.trim() || !password) {
      setMsg('Заполни ФИО, email и пароль')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ fullName, email, password }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      setMsg(data?.error || 'Ошибка регистрации')
      return
    }

    // По твоей логике: после регистрации отправляем на логин
    router.push('/login')
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    void submit()
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold">Регистрация</h1>

        <form
          className="mt-5 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Имя"
            autoComplete="name"
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleEnter}
            placeholder="Email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />

          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleEnter}
              placeholder="Пароль"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="h-11 w-full rounded-2xl border border-black/15 px-4 pr-24 outline-none focus:ring-2 focus:ring-black/10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              aria-pressed={showPassword}
              className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-neutral-700 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-black/10"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.58 10.58A2 2 0 0012 14a2 2 0 001.42-.58"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.67 16.67A11.94 11.94 0 0112 17c-5 0-9-5-9-5a17.74 17.74 0 014.26-4.84M9.88 5.09A10.86 10.86 0 0112 5c5 0 9 5 9 5a17.73 17.73 0 01-2.09 2.79"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.46 12S6 5 12 5s9.54 7 9.54 7-3.54 7-9.54 7-9.54-7-9.54-7z"
                  />
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
            disabled={loading}
            className="h-11 rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? 'Создаю…' : 'Зарегистрироваться'}
          </button>

          <div className="mt-2 text-center text-sm text-neutral-600">
            Уже есть аккаунт?{' '}
            <Link
              href="/login"
              className="font-semibold text-black underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
            >
              Войти
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
