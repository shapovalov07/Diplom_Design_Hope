'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const canSubmit = email.trim().length > 0 && !loading

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (loading) return

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setMessage('Укажите почту')
      return
    }

    if (!normalizedEmail.includes('@')) {
      setMessage('Некорректная почта')
      return
    }

    setLoading(true)
    setMessage(null)
    setPreviewUrl(null)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        setMessage(data?.error || 'Не удалось отправить ссылку')
        return
      }

      setMessage(data?.message || 'Проверьте почту: мы отправили ссылку на восстановление.')
      setPreviewUrl(data?.previewUrl || null)
    } catch {
      setMessage('Ошибка сети. Попробуйте ещё раз.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto mt-8 w-full max-w-[32rem] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-[36px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
        <div className="pointer-events-none absolute -left-10 top-0 h-40 w-40 rounded-full bg-[#B5292A]/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-32 w-32 rounded-full bg-[#252525]/10 blur-3xl" />

        <div className="relative rounded-[36px] bg-[#F2F2F2] p-4 sm:p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500">Восстановление</p>
          <h1 className="mt-1 text-3xl font-semibold leading-none text-[#252525]">Сброс пароля</h1>
          <p className="mt-3 max-w-lg text-sm text-neutral-600">
            Введите почту, указанную при регистрации. Если аккаунт существует, мы отправим ссылку
            для установки нового пароля.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <label className="grid gap-1.5">
              <span className="text-[10px] uppercase tracking-[0.2em] text-neutral-500">Почта</span>
              <input
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  if (message) setMessage(null)
                }}
                placeholder="почта@пример.рф"
                type="email"
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                className="h-11 rounded-[14px] border border-black/15 bg-white px-3.5 text-[15px] text-neutral-900 outline-none transition focus:border-black/35 focus:ring-2 focus:ring-black/10"
              />
            </label>

            {message && (
              <div className="rounded-[18px] border border-black/10 bg-white px-4 py-3 text-sm text-neutral-800">
                {message}
              </div>
            )}

            {previewUrl && (
              <a
                href={previewUrl}
                className="rounded-[18px] border border-dashed border-[#B5292A]/35 bg-[#B5292A]/5 px-4 py-3 text-sm text-[#8E2021] underline underline-offset-4"
              >
                Открыть тестовую ссылку восстановления
              </a>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-1 h-11 rounded-[18px] bg-[#252525] px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-neutral-500"
            >
              {loading ? 'Отправляю…' : 'Отправить ссылку'}
            </button>

            <div className="mt-1 border-t border-black/10 pt-3 text-center text-[15px] text-neutral-600">
              Вспомнили пароль?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#B5292A] underline decoration-[#B5292A]/30 underline-offset-4 hover:decoration-[#B5292A]/60"
              >
                Вернуться ко входу
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
