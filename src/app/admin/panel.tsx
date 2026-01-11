'use client'

import { useEffect, useState } from 'react'

type Review = {
  id: string
  authorName: string
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

export default function AdminPanel() {
  const [tab, setTab] = useState<'reviews' | 'portfolio'>('reviews')

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap gap-2">
        <TabButton active={tab === 'reviews'} onClick={() => setTab('reviews')}>
          Отзывы
        </TabButton>
        <TabButton active={tab === 'portfolio'} onClick={() => setTab('portfolio')}>
          Портфолио
        </TabButton>
      </div>

      <div className="mt-6">
        {tab === 'reviews' ? <AdminReviews /> : <AdminPortfolio />}
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

/* -------------------- REVIEWS -------------------- */

function AdminReviews() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

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
          items.map((r) => (
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

              <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-neutral-800">
                {r.text}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Btn onClick={() => approve(r.id, true)}>Approve</Btn>
                <Btn onClick={() => approve(r.id, false)}>Unapprove</Btn>
                <Btn variant="danger" onClick={() => del(r.id)}>Delete</Btn>
              </div>
            </div>
          ))
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
      const form = new FormData()
      form.append('file', file)

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
        setMsg({ type: 'err', text: upData?.error || 'Ошибка загрузки файла' })
        return
      }

      uploadedUrl = upData?.url || null
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
          items.map((p) => (
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
                  <Btn variant="danger" onClick={() => del(p.id)}>
                    Удалить
                  </Btn>
                </div>
              </div>

              {p.coverImageUrl && (
                <div className="mt-4 overflow-hidden rounded-2xl border border-black/10 bg-black/5">
                  <img src={p.coverImageUrl} alt={p.title} className="h-48 w-full object-cover" />
                </div>
              )}

              {p.description && (
                <div className="mt-3 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                  {p.description}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
