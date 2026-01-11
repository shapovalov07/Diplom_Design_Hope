'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
    setMsg(null)
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identifier, password }),
    })

    const data = await res.json().catch(() => null)
    setLoading(false)

    if (!res.ok) {
      setMsg(data?.error || 'Ошибка входа')
      return
    }

    router.replace('/')
    router.refresh() // ✅ заставляет обновиться layout/шапку
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold">Вход</h1>

        <div className="mt-5 grid gap-3">
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Email или ФИО"
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            type="password"
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />

          {msg && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-900">
              {msg}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
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
        </div>
      </div>
    </div>
  )
}
