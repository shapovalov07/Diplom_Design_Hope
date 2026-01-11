'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit() {
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

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
        <h1 className="text-2xl font-semibold">Регистрация</h1>

        <div className="mt-5 grid gap-3">
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ФИО"
            className="h-11 rounded-2xl border border-black/15 px-4 outline-none focus:ring-2 focus:ring-black/10"
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
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
        </div>
      </div>
    </div>
  )
}
