'use client'

import { useMemo, useState } from 'react'
import LogoutButton from '@/src/components/LogoutButton'

type ProfileFormProps = {
  initialFullName: string
  initialEmail: string
  role: 'USER' | 'ADMIN'
}

export default function ProfileForm({
  initialFullName,
  initialEmail,
  role,
}: ProfileFormProps) {
  const normalizedName = initialFullName.trim()
  const normalizedEmail = initialEmail.trim().toLowerCase()
  const [fullName, setFullName] = useState(normalizedName)
  const [email, setEmail] = useState(normalizedEmail)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [savedState, setSavedState] = useState({
    fullName: normalizedName,
    email: normalizedEmail,
  })

  const isDirty = useMemo(() => {
    const nextName = fullName.trim()
    const nextEmail = email.trim().toLowerCase()
    return nextName !== savedState.fullName || nextEmail !== savedState.email
  }, [fullName, email, savedState])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || !isDirty || !isEditing) return

    setSaving(true)
    setMsg(null)

    const payload = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
    }

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMsg({ type: 'err', text: data?.error || 'Ошибка сохранения' })
        setSaving(false)
        return
      }

      setSavedState({
        fullName: data?.user?.fullName || payload.fullName,
        email: data?.user?.email || payload.email,
      })
      setFullName(data?.user?.fullName || payload.fullName)
      setEmail(data?.user?.email || payload.email)
      setMsg({ type: 'ok', text: 'Данные сохранены' })
      setIsEditing(false)
    } catch {
      setMsg({ type: 'err', text: 'Ошибка сети. Попробуйте ещё раз.' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="reveal-up [--delay:60ms] overflow-hidden rounded-[32px] border border-black/10 bg-[#F2F2F2] text-sm text-neutral-700 shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-[#252525] px-6 py-5 text-white">
        <div>
          <h2 className="text-2xl font-semibold">Личные данные</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.24em]">
          <span className="rounded-full border border-white/25 px-3 py-1 text-white/80">
            роль: {role === 'ADMIN' ? 'admin' : 'user'}
          </span>
          {isEditing && (
            <span className="rounded-full bg-[#B5292A] px-3 py-1 text-white">редактирование</span>
          )}
        </div>
      </div>

      <div className="card-stripe">
        <div className="grid gap-5 p-6 pl-12">
          <div className="grid gap-4">
            <label className="grid w-full gap-2 sm:w-1/2">
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">ФИО</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ваше имя"
                disabled={!isEditing}
                className={[
                  'h-11 rounded-2xl border px-4 text-sm outline-none transition',
                  isEditing
                    ? 'border-black/15 bg-white text-neutral-900 focus:border-black/40'
                    : 'border-black/10 bg-white/40 text-neutral-500',
                ].join(' ')}
              />
            </label>
            <label className="grid w-full gap-2 sm:w-1/2">
              <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                type="email"
                disabled={!isEditing}
                className={[
                  'h-11 rounded-2xl border px-4 text-sm outline-none transition',
                  isEditing
                    ? 'border-black/15 bg-white text-neutral-900 focus:border-black/40'
                    : 'border-black/10 bg-white/40 text-neutral-500',
                ].join(' ')}
              />
            </label>
          </div>

          {msg && (
            <div
              className={[
                'rounded-2xl border px-4 py-3 text-sm',
                msg.type === 'ok'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-900',
              ].join(' ')}
            >
              {msg.text}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMsg(null)
                    setIsEditing(true)
                  }}
                  className="h-11 rounded-full bg-[#B5292A] px-6 text-sm font-semibold text-white transition hover:scale-[1.02]"
                >
                  Редактировать данные
                </button>
                <LogoutButton className="bg-[#252525]">
                  Выйти из аккаунта
                </LogoutButton>
              </>
            ) : (
              <>
                <button
                  type="submit"
                  disabled={saving || !isDirty}
                  className="h-11 rounded-full bg-[#B5292A] px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFullName(savedState.fullName)
                    setEmail(savedState.email)
                    setMsg(null)
                    setIsEditing(false)
                  }}
                  className="h-11 rounded-full border border-black/15 px-6 text-sm font-semibold text-neutral-900 hover:bg-white/70"
                >
                  Отменить
                </button>
                <LogoutButton className="bg-[#252525]">
                  Выйти из аккаунта
                </LogoutButton>
              </>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
