'use client'

import Link from 'next/link'
import { useState } from 'react'

type ResetPasswordFormProps = {
  initialToken: string
}

export default function ResetPasswordForm({ initialToken }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const canSubmit =
    password.length > 0 && confirmPassword.length > 0 && !loading && initialToken.length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit) return

    if (password !== confirmPassword) {
      setMessage({ type: 'err', text: 'Пароли не совпадают' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: initialToken, password }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setMessage({ type: 'err', text: data?.error || 'Не удалось обновить пароль' })
        return
      }

      setPassword('')
      setConfirmPassword('')
      setMessage({ type: 'ok', text: 'Пароль обновлён. Теперь можно войти с новым паролем.' })
    } catch {
      setMessage({ type: 'err', text: 'Ошибка сети. Попробуйте ещё раз.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-[32rem] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="pointer-events-none absolute -right-14 -top-10 h-40 w-40 rounded-full bg-[#B5292A]/15 blur-3xl" />

        <div className="relative rounded-[36px] bg-[#F2F2F2] p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Новый пароль</p>
          <h1 className="mt-1 text-3xl font-semibold leading-none text-[#252525]">
            Установить пароль
          </h1>
          <p className="mt-3 max-w-lg text-sm text-neutral-600">
            Ссылка из письма действует ограниченное время. После смены пароля старые сессии будут
            завершены автоматически.
          </p>

          {!initialToken ? (
            <div className="mt-5 rounded-[18px] border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-900">
              В ссылке отсутствует токен восстановления. Запросите новую ссылку.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
              <label className="grid gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Новый пароль
                </span>
                <input
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (message) setMessage(null)
                  }}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Минимум 8 символов"
                  className="h-11 rounded-[14px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  Повторите пароль
                </span>
                <input
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    if (message) setMessage(null)
                  }}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Повторите новый пароль"
                  className="h-11 rounded-[14px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="w-fit rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-neutral-700 hover:border-black/25 hover:text-black"
              >
                {showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              </button>

              {message && (
                <div
                  className={[
                    'rounded-[18px] border px-4 py-3 text-sm',
                    message.type === 'ok'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-900',
                  ].join(' ')}
                >
                  {message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={!canSubmit}
                className="mt-1 h-11 rounded-[18px] bg-[#252525] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-500"
              >
                {loading ? 'Сохраняю…' : 'Сменить пароль'}
              </button>
            </form>
          )}

          <div className="mt-4 border-t border-black/10 pt-3 text-center text-[15px] text-neutral-600">
            <Link
              href={initialToken ? '/login' : '/forgot-password'}
              className="font-semibold text-[#B5292A] underline decoration-[#B5292A]/30 underline-offset-4 hover:decoration-[#B5292A]/60"
            >
              {initialToken ? 'Перейти ко входу' : 'Запросить новую ссылку'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
