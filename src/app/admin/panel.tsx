'use client'

import LogoutButton from '@/src/components/LogoutButton'
import InquiryChat from '@/src/components/InquiryChat'
import { useEffect, useState } from 'react'

type AdminUser = {
  id: string
  fullName: string
  email: string
  role: 'USER' | 'ADMIN'
}

type Review = {
  id: string
  authorName: string
  avatarUrl?: string | null
  rating: number
  text: string
  isApproved: boolean
  createdAt: string
}

type PortfolioItem = {
  id: string
  title: string
  projectUrl: string
  description: string | null
  coverImageUrl: string | null
  isPublished: boolean
  createdAt: string
  publishedBy?: { id: string; fullName: string; email: string } | null
}

type Inquiry = {
  id: string
  userId: string
  serviceType: string
  description: string
  fullName: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
  user?: { fullName: string; email: string } | null
}

async function uploadCover(selectedFile: File) {
  const form = new FormData()
  form.append('file', selectedFile)

  const upRes = await fetch('/api/upload', {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  const upText = await upRes.text()
  let upData: any = null
  try {
    upData = upText ? JSON.parse(upText) : null
  } catch {
    upData = null
  }

  if (!upRes.ok) {
    return { ok: false, error: upData?.error || 'Ошибка загрузки файла' }
  }

  return { ok: true, url: upData?.url || null }
}

export default function AdminPanel({ user }: { user: AdminUser }) {
  const [tab, setTab] = useState<'reviews' | 'portfolio' | 'inquiries' | 'profile'>('reviews')

  return (
    <div className="mx-auto w-[80%] px-6 py-8">
      <div className="flex flex-wrap gap-2 rounded-[28px] border border-black/10 bg-white p-2 shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
        <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')}>
          Отзывы
        </TabButton>
        <TabButton active={tab === 'portfolio'} onClick={() => setTab('portfolio')}>
          Портфолио
        </TabButton>
        <TabButton active={tab === 'inquiries'} onClick={() => setTab('inquiries')}>
          Заявки
        </TabButton>
        <TabButton active={tab === 'profile'} onClick={() => setTab('profile')}>
          Профиль
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === 'reviews' ? (
          <AdminReviews />
        ) : tab === 'portfolio' ? (
          <AdminPortfolio />
        ) : tab === 'inquiries' ? (
          <AdminInquiries currentUserId={user.id} />
        ) : (
          <AdminProfile user={user} />
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'h-11 rounded-full px-5 text-[11px] font-semibold uppercase tracking-[0.24em] transition',
        active
          ? 'bg-[#B5292A] text-white shadow-[0_12px_30px_rgba(181,41,42,0.35)]'
          : 'border border-black/15 bg-white text-neutral-700 hover:bg-black/5 hover:text-black',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Badge({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em]',
        ok
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900'
          : 'border-amber-500/30 bg-amber-500/10 text-amber-900',
      ].join(' ')}
    >
      {children}
    </span>
  )
}

function Btn({
  variant = 'default',
  onClick,
  children,
}: {
  variant?: 'default' | 'danger'
  onClick?: () => void
  children: React.ReactNode
}) {
  const base =
    'h-9 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.2em] transition border'
  const cls =
    variant === 'danger'
      ? `${base} border-[#B5292A]/40 text-[#B5292A] hover:bg-[#B5292A]/10`
      : `${base} border-black/15 bg-white/70 text-neutral-800 hover:bg-black/5`

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="reveal-up overflow-hidden rounded-[32px] border border-black/10 bg-[#F2F2F2] text-sm text-neutral-700 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="border-b border-black/10 bg-white px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-[#252525]">{title}</h2>
            {subtitle && <p className="mt-1 text-xs text-neutral-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="card-stripe">
        <div className="p-6 pl-12">{children}</div>
      </div>
    </div>
  )
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

function AdminProfile({ user }: { user: AdminUser }) {
  const normalizedName = user.fullName.trim()
  const normalizedEmail = user.email.trim().toLowerCase()
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

  const isDirty =
    lastName.trim() !== savedState.lastName ||
    firstName.trim() !== savedState.firstName ||
    middleName.trim() !== savedState.middleName ||
    email.trim().toLowerCase() !== savedState.email
  const hasRequiredName = lastName.trim().length > 0 && firstName.trim().length > 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving || !isEditing || !isDirty) return

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
      const nextEmail = data?.user?.email || payload.email
      const nextNameParts = splitFullName(nextName)

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
    <div className="reveal-up overflow-hidden rounded-[32px] border border-black/10 bg-[#F2F2F2] text-sm text-neutral-700 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-[#252525] px-6 py-5 text-white">
        <div>
          <div className="text-[11px] uppercase tracking-[0.4em] text-white/60">админ</div>
          <h2 className="text-2xl font-semibold">Профиль</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card-stripe">
        <div className="grid gap-5 p-6 pl-12">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="grid w-full gap-2">
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Фамилия</span>
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
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Имя</span>
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
                <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Отчество</span>
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
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">Email</span>
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
      </form>
    </div>
  )
}

function StatusBadge({ status }: { status: Inquiry['status'] }) {
  const styles: Record<Inquiry['status'], string> = {
    NEW: 'border-amber-500/30 bg-amber-500/10 text-amber-900',
    IN_PROGRESS: 'border-sky-500/30 bg-sky-500/10 text-sky-900',
    DONE: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900',
  }

  const labels: Record<Inquiry['status'], string> = {
    NEW: 'Новая',
    IN_PROGRESS: 'В работе',
    DONE: 'Закрыта',
  }

  return (
    <span
      className={[
        'inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.2em]',
        styles[status],
      ].join(' ')}
    >
      {labels[status]}
    </span>
  )
}

function formatTimestamp(value: string) {
  const date = new Date(value)
  const day = date.toLocaleDateString()
  const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${day} ${time}`
}

function AdminInquiries({ currentUserId }: { currentUserId: string }) {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [openChatId, setOpenChatId] = useState<string | null>(null)
  const [view, setView] = useState<'active' | 'archive'>('active')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'IN_PROGRESS' | 'DONE'>('ALL')
  const [sortOrder, setSortOrder] = useState<'NEWEST' | 'OLDEST'>('NEWEST')
  const [searchTerm, setSearchTerm] = useState('')

  async function load() {
    setLoading(true)

    const res = await fetch('/api/admin/inquiries', {
      cache: 'no-store',
      credentials: 'include',
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      console.error('Admin inquiries API error:', res.status, text)
      setLoading(false)
      return
    }

    setItems(data?.inquiries || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function updateStatus(id: string, status: Inquiry['status']) {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/inquiries/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  const activeItems = items.filter((item) => item.status !== 'DONE')
  const archivedItems = items.filter((item) => item.status === 'DONE')
  const baseItems = view === 'archive' ? archivedItems : activeItems
  const filteredItems =
    view === 'archive' || statusFilter === 'ALL'
      ? baseItems
      : baseItems.filter((item) => item.status === statusFilter)
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const searchedItems = normalizedSearch
    ? filteredItems.filter((item) => {
        const text = [
          item.fullName,
          item.serviceType,
          item.description,
          item.user?.email,
          formatTimestamp(item.createdAt),
          item.status === 'NEW' ? 'Новая' : item.status === 'IN_PROGRESS' ? 'В работе' : 'Закрыта',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return text.includes(normalizedSearch)
      })
    : filteredItems
  const visibleItems = [...searchedItems].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime()
    const bTime = new Date(b.createdAt).getTime()
    return sortOrder === 'NEWEST' ? bTime - aTime : aTime - bTime
  })
  const statusOptions: Array<{ value: typeof statusFilter; label: string }> = [
    { value: 'ALL', label: 'Все' },
    { value: 'NEW', label: 'Новая' },
    { value: 'IN_PROGRESS', label: 'В работе' },
    { value: 'DONE', label: 'Закрыта' },
  ]
  const sortOptions: Array<{ value: typeof sortOrder; label: string }> = [
    { value: 'NEWEST', label: 'Сначала новые' },
    { value: 'OLDEST', label: 'Сначала старые' },
  ]

  function highlightMatch(text: string) {
    if (!normalizedSearch) return text
    const lowerText = text.toLowerCase()
    const lowerQuery = normalizedSearch
    const parts: React.ReactNode[] = []
    let start = 0

    while (start < text.length) {
      const idx = lowerText.indexOf(lowerQuery, start)
      if (idx === -1) {
        parts.push(text.slice(start))
        break
      }
      if (idx > start) {
        parts.push(text.slice(start, idx))
      }
      parts.push(
        <mark key={`${idx}-${parts.length}`} className="rounded bg-[#B5292A]/20 px-1">
          {text.slice(idx, idx + lowerQuery.length)}
        </mark>,
      )
      start = idx + lowerQuery.length
    }

    return parts
  }

  return (
    <Card title="Заявки" subtitle="Заявки с формы контактов.">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          {loading
            ? 'Загрузка…'
            : view === 'archive'
            ? `Архив: ${archivedItems.length}`
            : `Всего: ${activeItems.length}`}
        </div>
        <button
          onClick={load}
          className="text-sm font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
        >
          Обновить
        </button>
      </div>

      <div className="mt-4 grid gap-4 rounded-2xl border border-black/10 bg-white/70 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Статус</div>
          <div className="flex flex-wrap gap-2">
            {view === 'archive' ? (
              <span className="rounded-full border border-black/15 bg-neutral-100 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
                Закрыта
              </span>
            ) : (
              statusOptions.map((option) => {
                const active = statusFilter === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={[
                      'h-9 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition',
                      active
                        ? 'bg-[#B5292A] text-white shadow-[0_12px_30px_rgba(181,41,42,0.25)]'
                        : 'border border-black/15 bg-white text-neutral-700 hover:bg-black/5',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                )
              })
            )}
          </div>

          <div className="ml-auto w-full sm:w-auto">
            {/* <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Поиск</div> */}
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск по заявкам"
              className="mt-2 h-9 w-full rounded-full border border-black/15 bg-white px-4 text-xs font-semibold text-neutral-900 outline-none focus:border-black/30 sm:w-64"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">Новизна</div>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const active = sortOrder === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSortOrder(option.value)}
                  className={[
                    'h-9 rounded-full px-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition',
                    active
                      ? 'bg-[#252525] text-white'
                      : 'border border-black/15 bg-white text-neutral-700 hover:bg-black/5',
                  ].join(' ')}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            {normalizedSearch
              ? 'Ничего не найдено.'
              : view === 'archive'
              ? 'Архив пуст.'
              : 'Заявок пока нет.'}
          </div>
        ) : (
          visibleItems.map((item) => (
            <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{highlightMatch(item.fullName)}</div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {highlightMatch(formatTimestamp(item.createdAt))}
                  </div>
                  <div className="mt-2 text-sm text-neutral-700">
                    <span className="font-semibold">Услуга:</span> {highlightMatch(item.serviceType)}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {item.user?.email ? (
                      <>
                        Email: {highlightMatch(item.user.email)}
                      </>
                    ) : (
                      'Email: —'
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as Inquiry['status'])}
                    className="h-9 rounded-xl border border-black/15 bg-white px-3 text-sm font-semibold text-neutral-900"
                  >
                    <option value="NEW">Новая</option>
                    <option value="IN_PROGRESS">В работе</option>
                    <option value="DONE">Закрыта</option>
                  </select>
                  <Btn onClick={() => setOpenChatId(openChatId === item.id ? null : item.id)}>
                    {openChatId === item.id ? 'Скрыть чат' : 'Открыть чат'}
                  </Btn>
                  <Btn variant="danger" onClick={() => del(item.id)}>Удалить</Btn>
                </div>
              </div>

              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {highlightMatch(item.description)}
              </div>

              {openChatId === item.id && (
                <InquiryChat inquiryId={item.id} currentUserId={currentUserId} />
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            setView((prev) => (prev === 'archive' ? 'active' : 'archive'))
            setOpenChatId(null)
            setStatusFilter('ALL')
          }}
          className="h-10 rounded-full border border-black/15 px-5 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-900 hover:bg-neutral-50"
        >
          {view === 'archive' ? 'Вернуться к заявкам' : 'Перейти в архив'}
        </button>
        {view === 'active' && archivedItems.length > 0 && (
          <div className="text-xs text-neutral-500">
            Закрытых заявок: {archivedItems.length}
          </div>
        )}
      </div>
    </Card>
  )
}

/* -------------------- REVIEWS -------------------- */

function AdminReviews() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({
    authorName: '',
    rating: 5,
    text: '',
    avatarUrl: '',
  })
  const [editMsg, setEditMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)

    const res = await fetch('/api/admin/reviews', {
      cache: 'no-store',
      credentials: 'include',
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      console.error('Admin reviews API error:', res.status, text)
      setLoading(false)
      return
    }

    setItems(data?.reviews || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function approve(id: string, isApproved: boolean) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isApproved }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  function startEdit(item: Review) {
    setEditingId(item.id)
    setDraft({
      authorName: item.authorName,
      rating: item.rating,
      text: item.text,
      avatarUrl: item.avatarUrl || '',
    })
    setEditMsg(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditMsg(null)
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    setEditMsg(null)

    const res = await fetch(`/api/admin/reviews/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        authorName: draft.authorName,
        rating: draft.rating,
        text: draft.text,
        avatarUrl: draft.avatarUrl ? draft.avatarUrl.trim() : null,
      }),
    })

    const data = await res.json().catch(() => ({}))
    setSaving(false)

    if (!res.ok) {
      setEditMsg({ type: 'err', text: data?.error || 'Ошибка сохранения' })
      return
    }

    setEditingId(null)
    load()
  }

  return (
    <Card title="Модерация отзывов" subtitle="Approve/Unapprove, удаление, просмотр статуса.">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          {loading ? 'Загрузка…' : `Всего: ${items.length}`}
        </div>
        <button onClick={load} className="text-sm font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40">
          Обновить
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            Отзывов пока нет.
          </div>
        ) : (
          items.map((r) => {
            const isEditing = editingId === r.id

            return (
              <div key={r.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{r.authorName}</div>
                      <Badge ok={r.isApproved}>
                        {r.isApproved ? 'Approved' : 'Not approved'}
                      </Badge>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="shrink-0 rounded-2xl border border-black/10 bg-white px-3 py-2 text-right">
                    <div className="text-sm tracking-[0.2em] text-neutral-800 select-none">
                      {'★★★★★'.slice(0, r.rating)}
                      <span className="opacity-30">{'★★★★★'.slice(r.rating)}</span>
                    </div>
                    <div className="text-xs text-neutral-500">{r.rating}/5</div>
                  </div>
                </div>

                {isEditing ? (
                  <div className="mt-3 grid gap-3 rounded-2xl border border-black/10 bg-neutral-50 p-4">
                    <label className="grid gap-2 text-sm text-neutral-700">
                      Имя автора
                      <input
                        value={draft.authorName}
                        onChange={(e) => setDraft((prev) => ({ ...prev, authorName: e.target.value }))}
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-neutral-700">
                      Оценка
                      <select
                        value={draft.rating}
                        onChange={(e) => setDraft((prev) => ({ ...prev, rating: Number(e.target.value) }))}
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      >
                        {[5, 4, 3, 2, 1].map((v) => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    <label className="grid gap-2 text-sm text-neutral-700">
                      Текст
                      <textarea
                        value={draft.text}
                        onChange={(e) => setDraft((prev) => ({ ...prev, text: e.target.value }))}
                        rows={4}
                        className="rounded-xl border border-black/15 bg-white px-3 py-2 outline-none resize-y"
                      />
                    </label>
                    <label className="grid gap-2 text-sm text-neutral-700">
                      Аватар URL (необязательно)
                      <input
                        value={draft.avatarUrl}
                        onChange={(e) => setDraft((prev) => ({ ...prev, avatarUrl: e.target.value }))}
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      />
                    </label>

                    {editMsg && (
                      <div
                        className={[
                          'rounded-2xl border px-4 py-3 text-sm',
                          editMsg.type === 'ok'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-900',
                        ].join(' ')}
                      >
                        {editMsg.text}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                    {r.text}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Btn onClick={() => approve(r.id, true)}>Approve</Btn>
                  <Btn onClick={() => approve(r.id, false)}>Unapprove</Btn>
                  {isEditing ? (
                    <>
                      <Btn onClick={saveEdit}>{saving ? 'Сохраняю…' : 'Сохранить'}</Btn>
                      <Btn onClick={cancelEdit}>Отмена</Btn>
                    </>
                  ) : (
                    <Btn onClick={() => startEdit(r)}>Редактировать</Btn>
                  )}
                  <Btn variant="danger" onClick={() => del(r.id)}>Delete</Btn>
                </div>
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}

/* -------------------- PORTFOLIO -------------------- */

function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(false)

  // форма
  const [title, setTitle] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [description, setDescription] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // файл
  const [file, setFile] = useState<File | null>(null)

  // редактирование
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState({
    title: '',
    projectUrl: '',
    description: '',
    coverImageUrl: '',
    isPublished: false,
  })
  const [editFile, setEditFile] = useState<File | null>(null)
  const [editMsg, setEditMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  async function load() {
    setLoading(true)

    const res = await fetch('/api/admin/portfolio', {
      cache: 'no-store',
      credentials: 'include',
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      console.error('Admin portfolio API error:', res.status, text)
      setLoading(false)
      return
    }

    setItems(data?.items || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    setMsg(null)

    if (!title.trim() || !projectUrl.trim()) {
      setMsg({ type: 'err', text: 'Заполни название и ссылку на проект' })
      return
    }

    // 1) upload (если есть файл)
    let uploadedUrl: string | null = null

    if (file) {
      const upload = await uploadCover(file)
      if (!upload.ok) {
        setMsg({ type: 'err', text: upload.error || 'Ошибка загрузки файла' })
        return
      }
      uploadedUrl = upload.url
    }

    // 2) create item
    const res = await fetch('/api/admin/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title,
        projectUrl,
        description: description || null,
        coverImageUrl: uploadedUrl,
        isPublished,
      }),
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      setMsg({ type: 'err', text: data?.error || 'Ошибка создания' })
      return
    }

    setTitle('')
    setProjectUrl('')
    setDescription('')
    setIsPublished(false)
    setFile(null)
    setMsg({ type: 'ok', text: 'Создано ✅' })
    load()
  }

  async function togglePublish(id: string, next: boolean) {
    await fetch(`/api/admin/portfolio/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ isPublished: next }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE', credentials: 'include' })
    load()
  }

  function startEdit(item: PortfolioItem) {
    setEditingId(item.id)
    setEditDraft({
      title: item.title,
      projectUrl: item.projectUrl,
      description: item.description || '',
      coverImageUrl: item.coverImageUrl || '',
      isPublished: item.isPublished,
    })
    setEditFile(null)
    setEditMsg(null)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditFile(null)
    setEditMsg(null)
  }

  async function saveEdit() {
    if (!editingId) return
    setSavingEdit(true)
    setEditMsg(null)

    if (!editDraft.title.trim() || !editDraft.projectUrl.trim()) {
      setEditMsg({ type: 'err', text: 'Заполни название и ссылку на проект' })
      setSavingEdit(false)
      return
    }

    let uploadedUrl: string | null = null

    if (editFile) {
      const upload = await uploadCover(editFile)
      if (!upload.ok) {
        setEditMsg({ type: 'err', text: upload.error || 'Ошибка загрузки файла' })
        setSavingEdit(false)
        return
      }
      uploadedUrl = upload.url
    }

    const res = await fetch(`/api/admin/portfolio/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title: editDraft.title,
        projectUrl: editDraft.projectUrl,
        description: editDraft.description || null,
        coverImageUrl: uploadedUrl ?? (editDraft.coverImageUrl ? editDraft.coverImageUrl : null),
        isPublished: editDraft.isPublished,
      }),
    })

    const text = await res.text()
    let data: any = null
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      setEditMsg({ type: 'err', text: data?.error || 'Ошибка сохранения' })
      setSavingEdit(false)
      return
    }

    setSavingEdit(false)
    setEditingId(null)
    setEditFile(null)
    load()
  }

  return (
    <Card title="Портфолио" subtitle="Создание, публикация/снятие, удаление, обложка через загрузку файла.">
      {/* form */}
      <div className="grid gap-4 rounded-2xl border border-black/10 bg-neutral-50 p-4">
        <div className="grid gap-2">
          <label className="text-sm text-neutral-700">Название</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-11 rounded-2xl border border-black/15 bg-white px-4 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-neutral-700">Ссылка на проект</label>
          <input
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://example.com"
            className="h-11 rounded-2xl border border-black/15 bg-white px-4 outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="text-xs text-neutral-500">Ссылка должна начинаться с https://</div>
        </div>

        <div className="grid gap-2">
          <label className="text-sm text-neutral-700">Описание</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-2xl border border-black/15 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 resize-y"
          />
        </div>

        <div className="grid gap-2">
          <span className="text-sm text-neutral-700">Обложка (файл с ПК) — необязательно</span>

          <div className="flex flex-wrap items-center gap-3">
            <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black/15 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 active:scale-[0.98]">
              📁 Выберите файл
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </label>

            {file ? (
              <div className="text-xs text-neutral-600">
                Выбран: <span className="font-medium">{file.name}</span>
                <button
                  className="ml-2 text-xs font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                  onClick={() => setFile(null)}
                  type="button"
                >
                  убрать
                </button>
              </div>
            ) : (
              <div className="text-xs text-neutral-500">Файл не выбран</div>
            )}
          </div>
        </div>

        <label className="flex items-center gap-3 text-sm text-neutral-700">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-black/20"
          />
          Опубликовать сразу
        </label>

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

        <button
          onClick={create}
          className="h-11 rounded-2xl bg-black px-4 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Создать работу
        </button>
      </div>

      {/* list */}
      <div className="mt-5 flex items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          {loading ? 'Загрузка…' : `Всего работ: ${items.length}`}
        </div>
        <button onClick={load} className="text-sm font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40">
          Обновить
        </button>
      </div>

      <div className="mt-6 grid gap-8 sm:grid-cols-2">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-6 text-center text-sm text-neutral-600 sm:col-span-2">
            Работ пока нет.
          </div>
        ) : (
          items.map((p) => {
            const isEditing = editingId === p.id

            return (
              <div key={p.id} className="grid gap-3">
                {!isEditing && (
                  <>
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_70px_rgba(0,0,0,0.10)]">
                        <div className="relative aspect-[16/9] bg-black/5">
                          {p.coverImageUrl ? (
                            <img
                              src={p.coverImageUrl}
                              alt={p.title}
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
                              Нет обложки
                            </div>
                          )}

                          <div className="pointer-events-none absolute right-3 top-3 rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                            Открыть ↗
                          </div>
                        </div>

                        <div className="px-5 pb-5">
                          <div className="pt-4">
                            <h3 className="text-lg font-semibold leading-snug tracking-tight">
                              {p.title}
                            </h3>

                            {p.description && (
                              <p className="mt-3 line-clamp-2 text-sm text-neutral-600">
                                {p.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </a>

                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge ok={p.isPublished}>{p.isPublished ? 'Published' : 'Draft'}</Badge>
                        <div className="text-xs text-neutral-500">
                          {formatTimestamp(p.createdAt)} · Опубликовал: {p.publishedBy?.fullName || '—'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Btn onClick={() => togglePublish(p.id, !p.isPublished)}>
                          {p.isPublished ? 'Снять' : 'Опубликовать'}
                        </Btn>
                        <Btn onClick={() => startEdit(p)}>Редактировать</Btn>
                        <Btn variant="danger" onClick={() => del(p.id)}>
                          Удалить
                        </Btn>
                      </div>
                    </div>
                  </>
                )}

                {isEditing && (
                  <div className="grid gap-3 rounded-2xl border border-black/10 bg-white/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
                    <label className="grid gap-2 text-sm text-neutral-700">
                      Название
                      <input
                        value={editDraft.title}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-neutral-700">
                      Ссылка на проект
                      <input
                        value={editDraft.projectUrl}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, projectUrl: e.target.value }))}
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-neutral-700">
                      Описание
                      <textarea
                        value={editDraft.description}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        className="rounded-xl border border-black/15 bg-white px-3 py-2 outline-none resize-y"
                      />
                    </label>

                    <label className="grid gap-2 text-sm text-neutral-700">
                      Обложка URL
                      <input
                        value={editDraft.coverImageUrl}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, coverImageUrl: e.target.value }))}
                        placeholder="https://example.com/image.jpg"
                        className="h-10 rounded-xl border border-black/15 bg-white px-3 outline-none"
                      />
                    </label>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-700">
                      <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100 active:scale-[0.98]">
                        📁 Новый файл
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => setEditFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      {editFile ? (
                        <div className="text-xs text-neutral-600">
                          Выбран: <span className="font-medium">{editFile.name}</span>
                          <button
                            className="ml-2 text-xs font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                            onClick={() => setEditFile(null)}
                            type="button"
                          >
                            убрать
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-neutral-500">Файл не выбран</div>
                      )}
                    </div>

                    <label className="flex items-center gap-3 text-sm text-neutral-700">
                      <input
                        type="checkbox"
                        checked={editDraft.isPublished}
                        onChange={(e) => setEditDraft((prev) => ({ ...prev, isPublished: e.target.checked }))}
                        className="h-4 w-4 rounded border-black/20"
                      />
                      Опубликовать
                    </label>

                    {editMsg && (
                      <div
                        className={[
                          'rounded-2xl border px-4 py-3 text-sm',
                          editMsg.type === 'ok'
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-900'
                            : 'border-rose-500/30 bg-rose-500/10 text-rose-900',
                        ].join(' ')}
                      >
                        {editMsg.text}
                      </div>
                    )}

                    {editDraft.coverImageUrl && (
                      <div className="overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                        <img src={editDraft.coverImageUrl} alt="Обложка" className="h-40 w-full object-cover" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      <Btn onClick={saveEdit}>{savingEdit ? 'Сохраняю…' : 'Сохранить'}</Btn>
                      <Btn onClick={cancelEdit}>Отмена</Btn>
                      <Btn variant="danger" onClick={() => del(p.id)}>
                        Удалить
                      </Btn>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </Card>
  )
}
