'use client'

import { useMemo, useState } from 'react'
import LogoutButton from '@/src/components/LogoutButton'

type ProfileFormProps = {
  initialFullName: string
  initialEmail: string
}

function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return { lastName: '', firstName: '', middleName: '' }
  }
  if (parts.length === 1) {
    return { lastName: '', firstName: parts[0], middleName: '' }
  }
  const [lastName, firstName, ...rest] = parts
  return { lastName, firstName, middleName: rest.join(' ') }
}

function joinFullName({
  lastName,
  firstName,
  middleName,
}: {
  lastName: string
  firstName: string
  middleName: string
}) {
  return [lastName, firstName, middleName]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(' ')
}

export default function ProfileForm({ initialFullName, initialEmail }: ProfileFormProps) {
  const normalizedName = initialFullName.trim()
  const normalizedEmail = initialEmail.trim().toLowerCase()
  const initialNameParts = splitFullName(normalizedName)
  const [lastName, setLastName] = useState(initialNameParts.lastName)
  const [firstName, setFirstName] = useState(initialNameParts.firstName)
  const [middleName, setMiddleName] = useState(initialNameParts.middleName)
  const [email, setEmail] = useState(normalizedEmail)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [savedState, setSavedState] = useState({
    lastName: initialNameParts.lastName,
    firstName: initialNameParts.firstName,
    middleName: initialNameParts.middleName,
    email: normalizedEmail,
  })

  const isDirty = useMemo(() => {
    const nextEmail = email.trim().toLowerCase()
    return (
      lastName.trim() !== savedState.lastName ||
      firstName.trim() !== savedState.firstName ||
      middleName.trim() !== savedState.middleName ||
      nextEmail !== savedState.email
    )
  }, [lastName, firstName, middleName, email, savedState])
  const hasRequiredName = lastName.trim().length > 0 && firstName.trim().length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || !isDirty || !isEditing) return

    setSaving(true)
    setMsg(null)

    if (!hasRequiredName) {
      setMsg({ type: 'err', text: 'Заполните фамилию и имя' })
      setSaving(false)
      return
    }
    const fullName = joinFullName({ lastName, firstName, middleName })

    const payload = {
      fullName,
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

      const nextName = data?.user?.fullName || payload.fullName
      const nextNameParts = splitFullName(nextName)
      const nextEmail = data?.user?.email || payload.email

      setSavedState({
        lastName: nextNameParts.lastName,
        firstName: nextNameParts.firstName,
        middleName: nextNameParts.middleName,
        email: nextEmail,
      })
      setLastName(nextNameParts.lastName)
      setFirstName(nextNameParts.firstName)
      setMiddleName(nextNameParts.middleName)
      setEmail(nextEmail)
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
          {isEditing && (
            <span className="rounded-full bg-[#B5292A] px-3 py-1 text-white">редактирование</span>
          )}
        </div>
      </div>

      <div className="card-stripe">
        <div className="grid gap-5 p-6 pl-12">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid w-full gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Фамилия</span>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Иванов"
                  required
                  disabled={!isEditing}
                  className={[
                    'h-11 rounded-2xl border px-4 text-sm outline-none transition',
                    isEditing
                      ? 'border-black/15 bg-white text-neutral-900 focus:border-black/40'
                      : 'border-black/10 bg-white/40 text-neutral-500',
                  ].join(' ')}
                />
              </label>
              <label className="grid w-full gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Имя</span>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                  required
                  disabled={!isEditing}
                  className={[
                    'h-11 rounded-2xl border px-4 text-sm outline-none transition',
                    isEditing
                      ? 'border-black/15 bg-white text-neutral-900 focus:border-black/40'
                      : 'border-black/10 bg-white/40 text-neutral-500',
                  ].join(' ')}
                />
              </label>
              <label className="grid w-full gap-2">
                <span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Отчество</span>
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="Иванович"
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
                  disabled={saving || !isDirty || !hasRequiredName}
                  className="h-11 rounded-full bg-[#B5292A] px-6 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Сохранение…' : 'Сохранить'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLastName(savedState.lastName)
                    setFirstName(savedState.firstName)
                    setMiddleName(savedState.middleName)
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
