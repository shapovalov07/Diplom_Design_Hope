'use client'

import LogoutButton from '@/src/components/LogoutButton'
import { useEffect, useState } from 'react'
import { withCsrfHeaders } from '@/src/lib/csrf-client'

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

export default function AdminPanel({ user }: { user: AdminUser }) {
  const [tab, setTab] = useState<'reviews' | 'portfolio' | 'inquiries' | 'profile'>('reviews')

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap gap-2">
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
          <AdminInquiries />
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
        'h-10 rounded-xl px-4 text-sm font-semibold transition',
        active
          ? 'bg-black text-white'
          : 'border border-black/15 bg-white text-neutral-900 hover:bg-neutral-50',
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
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs',
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
    'h-9 rounded-xl px-3 text-sm font-semibold transition border'
  const cls =
    variant === 'danger'
      ? `${base} border-rose-500/40 text-rose-700 hover:bg-rose-500/10`
      : `${base} border-black/15 text-neutral-900 hover:bg-neutral-50`

  return (
    <button onClick={onClick} className={cls}>
      {children}
    </button>
  )
}

function Card({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-black/10 bg-white/80 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="border-b border-black/5 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function AdminProfile({ user }: { user: AdminUser }) {
  return (
    <Card title="Профиль администратора" subtitle="Информация о аккаунте и выход.">
      <div className="text-sm text-neutral-700">
        <div><b>ФИО:</b> {user.fullName}</div>
        <div><b>Email:</b> {user.email}</div>
        <div><b>Роль:</b> {user.role}</div>
      </div>
      <LogoutButton className="mt-5 bg-[#B5292A]">
        Выйти из аккаунта
      </LogoutButton>
    </Card>
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
    <span className={['inline-flex items-center rounded-full border px-2.5 py-1 text-xs', styles[status]].join(' ')}>
      {labels[status]}
    </span>
  )
}

function AdminInquiries() {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)

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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/inquiries/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: withCsrfHeaders(),
    })
    load()
  }

  return (
    <Card title="Заявки" subtitle="Заявки с формы контактов.">
      <div className="flex items-center justify-between gap-4">
        <div className="text-sm text-neutral-500">
          {loading ? 'Загрузка…' : `Всего: ${items.length}`}
        </div>
        <button
          onClick={load}
          className="text-sm font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
        >
          Обновить
        </button>
      </div>

      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            Заявок пока нет.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold truncate">{item.fullName}</div>
                    <StatusBadge status={item.status} />
                  </div>
                  <div className="mt-1 text-xs text-neutral-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div className="mt-2 text-sm text-neutral-700">
                    <span className="font-semibold">Услуга:</span> {item.serviceType}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500">
                    {item.user?.email ? `Email: ${item.user.email}` : 'Email: —'}
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
                  <Btn variant="danger" onClick={() => del(item.id)}>Удалить</Btn>
                </div>
              </div>

              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {item.description}
              </div>
            </div>
          ))
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ isApproved }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/reviews/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: withCsrfHeaders(),
    })
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
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

async function uploadCover(selectedFile: File) {
  const form = new FormData()
  form.append('file', selectedFile)

  const upRes = await fetch('/api/upload', {
    method: 'POST',
    headers: withCsrfHeaders(),
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ isPublished: next }),
    })
    load()
  }

  async function del(id: string) {
    await fetch(`/api/admin/portfolio/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: withCsrfHeaders(),
    })
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
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

      <div className="mt-4 grid gap-3">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/15 bg-neutral-50 p-6 text-center text-sm text-neutral-600">
            Работ пока нет.
          </div>
        ) : (
          items.map((p) => {
            const isEditing = editingId === p.id

            return (
              <div key={p.id} className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold truncate">{p.title}</div>
                      <Badge ok={p.isPublished}>{p.isPublished ? 'Published' : 'Draft'}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </div>

                    <div className="mt-2 text-sm">
                      <a
                        href={p.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
                      >
                        Открыть проект ↗
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Btn onClick={() => togglePublish(p.id, !p.isPublished)}>
                      {p.isPublished ? 'Снять' : 'Опубликовать'}
                    </Btn>
                    {isEditing ? (
                      <>
                        <Btn onClick={saveEdit}>{savingEdit ? 'Сохраняю…' : 'Сохранить'}</Btn>
                        <Btn onClick={cancelEdit}>Отмена</Btn>
                      </>
                    ) : (
                      <Btn onClick={() => startEdit(p)}>Редактировать</Btn>
                    )}
                    <Btn variant="danger" onClick={() => del(p.id)}>
                      Удалить
                    </Btn>
                  </div>
                </div>

                {!isEditing && p.coverImageUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                    <img src={p.coverImageUrl} alt={p.title} className="h-48 w-full object-cover" />
                  </div>
                )}

                {!isEditing && p.description && (
                  <div className="mt-3 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                    {p.description}
                  </div>
                )}

                {isEditing && (
                  <div className="mt-4 grid gap-3 rounded-2xl border border-black/10 bg-neutral-50 p-4">
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
