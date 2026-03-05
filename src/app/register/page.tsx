'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const canSubmit =
    lastName.trim().length > 0 &&
    firstName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length > 0 &&
    !loading

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    setMsg(null)

    const normalizedLastName = lastName.trim()
    const normalizedFirstName = firstName.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedLastName || !normalizedFirstName || !normalizedEmail || !password) {
      setMsg('Заполни фамилию, имя, почту и пароль')
      return
    }

    if (!normalizedEmail.includes('@')) {
      setMsg('Некорректная почта')
      return
    }

    const fullName = [normalizedLastName, normalizedFirstName].join(' ')

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ fullName, email: normalizedEmail, password }),
      })

      const data = await res.json().catch(() => null)

      if (!res.ok) {
        setMsg(data?.error || 'Ошибка регистрации')
        return
      }

      router.push('/login')
    } catch {
      setMsg('Ошибка сети. Попробуй еще раз')
    } finally {
      setLoading(false)
    }
  }

  function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter') return
    e.preventDefault()
    void submit()
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-[30rem] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-[#B5292A]/15 blur-3xl" />
        <div className="pointer-events-none absolute left-0 top-0 hidden h-full w-3 bg-[repeating-linear-gradient(to_bottom,#6A6A6A_0_3px,transparent_3px_8px)] opacity-60 sm:block" />
        <div className="relative rounded-[36px] bg-[#F2F2F2] p-4 sm:p-5">
          <div className="flex items-start">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Авторизация</p>
              <h1 className="mt-1 text-3xl font-semibold leading-none text-[#252525]">Регистрация</h1>
            </div>
          </div>

          <form onSubmit={submit} className="mt-5 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Фамилия</span>
              <input
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (msg) setMsg(null)
                }}
                placeholder="Иванов"
                name="lastName"
                autoComplete="family-name"
                className="h-10 rounded-[12px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Имя</span>
              <input
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (msg) setMsg(null)
                }}
                placeholder="Иван"
                name="firstName"
                autoComplete="given-name"
                className="h-10 rounded-[12px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Почта</span>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (msg) setMsg(null)
                }}
                placeholder="почта@пример.рф"
                type="email"
                name="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="h-10 rounded-[12px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Пароль</span>
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
                  autoComplete="new-password"
                  className="h-10 w-full rounded-[12px] border border-black/15 bg-white px-3.5 pr-16 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 inline-flex h-7 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white text-neutral-600 transition hover:border-black/25 hover:text-black"
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
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
                      className="h-4 w-4"
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
            </label>

            {msg && (
              <div className="rounded-[18px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-900">
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 h-10 rounded-[18px] bg-[#252525] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-500"
            >
              {loading ? 'Создаю…' : 'Зарегистрироваться'}
            </button>

            <div className="mt-1 border-t border-black/10 pt-3 text-center text-[15px] text-neutral-600">
              Уже есть аккаунт?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#B5292A] underline decoration-[#B5292A]/30 underline-offset-4 hover:decoration-[#B5292A]/60"
              >
                Войти
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
