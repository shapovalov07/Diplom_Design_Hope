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
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => setTab('reviews')} style={btn(tab === 'reviews')}>
          Отзывы
        </button>
        <button onClick={() => setTab('portfolio')} style={btn(tab === 'portfolio')}>
          Портфолио
        </button>
      </div>

      {tab === 'reviews' ? <AdminReviews /> : <AdminPortfolio />}
    </div>
  )
}

function btn(active: boolean): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #333',
    cursor: 'pointer',
    background: active ? '#333' : 'transparent',
    color: active ? '#fff' : '#000',
  }
}

function AdminReviews() {
  const [items, setItems] = useState<Review[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/reviews', { cache: 'no-store', credentials: 'include' })
    const data = await res.json()
    setItems(data.reviews || [])
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
    <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>Модерация отзывов</h2>
      {loading && <div>Загрузка…</div>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((r) => (
          <div key={r.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{r.authorName}</strong>
              <span>⭐ {r.rating}</span>
            </div>
            <div style={{ marginTop: 8 }}>{r.text}</div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => approve(r.id, true)} style={miniBtn}>
                Approve
              </button>
              <button onClick={() => approve(r.id, false)} style={miniBtn}>
                Unapprove
              </button>
              <button onClick={() => del(r.id)} style={{ ...miniBtn, borderColor: 'crimson', color: 'crimson' }}>
                Delete
              </button>

              <span style={{ fontSize: 12, opacity: 0.7 }}>
                {r.isApproved ? '✅ Approved' : '⏳ Not approved'} • {new Date(r.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
        ))}

        {items.length === 0 && <div style={{ opacity: 0.7 }}>Отзывов пока нет.</div>}
      </div>
    </div>
  )
}

const miniBtn: React.CSSProperties = {
  padding: '8px 10px',
  borderRadius: 10,
  border: '1px solid #333',
  cursor: 'pointer',
  background: 'transparent',
}

function AdminPortfolio() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(false)

  // форма создания
  const [title, setTitle] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [description, setDescription] = useState('')
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [isPublished, setIsPublished] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/portfolio', { cache: 'no-store', credentials: 'include' })
    const data = await res.json()
    setItems(data.items || [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  async function create() {
    setMsg(null)

    const res = await fetch('/api/admin/portfolio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        title,
        projectUrl,
        description: description || null,
        coverImageUrl: coverImageUrl || null,
        isPublished,
      }),
    })

    const data = await res.json()
    if (!res.ok) {
      setMsg(data?.error || 'Ошибка создания')
      return
    }

    setTitle('')
    setProjectUrl('')
    setDescription('')
    setCoverImageUrl('')
    setIsPublished(false)
    setMsg('Создано ✅')
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
    <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16 }}>
      <h2 style={{ fontSize: 18, marginBottom: 10 }}>Портфолио (CRUD)</h2>

      <div style={{ display: 'grid', gap: 10, maxWidth: 720, marginBottom: 16 }}>
        <div style={{ display: 'grid', gap: 6 }}>
          <span>Название</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <span>Ссылка на проект</span>
          <input
            value={projectUrl}
            onChange={(e) => setProjectUrl(e.target.value)}
            placeholder="https://example.com"
            style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <span>Описание</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <span>Обложка (URL картинки) — необязательно</span>
          <input
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://.../image.jpg"
            style={{ padding: 10, borderRadius: 10, border: '1px solid #ccc' }}
          />
        </div>

        <label style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Опубликовать сразу
        </label>

        <button onClick={create} style={{ padding: 12, borderRadius: 10, border: '1px solid #333', cursor: 'pointer' }}>
          Создать работу
        </button>

        {msg && <div>{msg}</div>}
      </div>

      {loading && <div>Загрузка…</div>}

      <div style={{ display: 'grid', gap: 10 }}>
        {items.map((p) => (
          <div key={p.id} style={{ border: '1px solid #eee', borderRadius: 12, padding: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <strong>{p.title}</strong>
              <span style={{ fontSize: 12, opacity: 0.7 }}>{new Date(p.createdAt).toLocaleString()}</span>
            </div>

            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.8 }}>
              <a href={p.projectUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                {p.projectUrl}
              </a>
            </div>

            {p.description && <div style={{ marginTop: 8 }}>{p.description}</div>}

            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => togglePublish(p.id, !p.isPublished)} style={miniBtn}>
                {p.isPublished ? 'Снять с публикации' : 'Опубликовать'}
              </button>

              <button onClick={() => del(p.id)} style={{ ...miniBtn, borderColor: 'crimson', color: 'crimson' }}>
                Удалить
              </button>

              <span style={{ fontSize: 12, opacity: 0.7 }}>{p.isPublished ? '✅ Published' : '⏳ Draft'}</span>
            </div>
          </div>
        ))}

        {items.length === 0 && <div style={{ opacity: 0.7 }}>Работ пока нет.</div>}
      </div>
    </div>
  )
}
