'use client'

import { useEffect, useMemo, useState } from 'react'

type Review = {
  id: string
  authorName: string
  avatarUrl: string | null
  rating: number
  text: string
  createdAt: string
}

export default function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function load() {
    const res = await fetch('/api/reviews', { cache: 'no-store' })
    const data = await res.json()
    setReviews(data.reviews || [])
  }

  useEffect(() => {
    load()
  }, [])

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }, [reviews])

  async function submit() {
    setMsg(null)
    setLoading(true)

    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rating, text }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setMsg({ type: 'err', text: data?.error || 'Ошибка отправки' })
      return
    }

    setText('')
    setMsg({ type: 'ok', text: 'Отзыв отправлен на модерацию ✅' })
    load()
  }

  const stars = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)

  return (
    <section className="grid gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Отзывы клиентов</h2>
          <p className="mt-1 text-sm text-neutral-500">
            Реальные отзывы. Новые отзывы появляются после модерации.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm">
            <div className="text-lg font-semibold">{reviews.length}</div>
            <div className="text-xs text-neutral-500">опубликовано</div>
          </div>
          <div className="rounded-2xl border border-black/10 bg-white/70 px-4 py-3 shadow-sm min-w-[140px]">
            <div className="text-lg font-semibold">
              {avgRating ? (
                <>
                  {avgRating} <span className="text-neutral-500 font-normal">из 5</span>
                </>
              ) : (
                '—'
              )}
            </div>
            <div className="text-xs text-neutral-500">средняя оценка</div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        {/* Form */}
        <div className="rounded-3xl border border-black/10 bg-white/80 shadow-lg overflow-hidden">
          <div className="flex items-start justify-between gap-3 border-b border-black/5 p-5">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Оставить отзыв</h3>
              <p className="mt-1 text-sm text-neutral-500">
                Доступно только для залогиненных пользователей.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-600">
              Модерация
            </span>
          </div>

          <div className="p-5 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm text-neutral-700">Оценка</span>
              <div className="grid gap-3 sm:grid-cols-[180px_1fr] sm:items-center">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="h-11 w-full rounded-2xl border border-black/15 bg-white px-3 outline-none focus:ring-2 focus:ring-black/10"
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v} {v === 1 ? 'звезда' : v < 5 ? 'звезды' : 'звёзд'}
                    </option>
                  ))}
                </select>

                <div
                  className="text-sm tracking-[0.2em] text-neutral-800 select-none"
                  aria-label={`Рейтинг: ${rating} из 5`}
                >
                  {'★★★★★'.slice(0, rating)}
                  <span className="opacity-30">{'★★★★★'.slice(rating)}</span>
                </div>
              </div>
            </label>

            <label className="grid gap-2">
              <span className="text-sm text-neutral-700">Текст отзыва</span>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={5}
                placeholder="Например: быстро, аккуратно, результат превзошёл ожидания…"
                className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black/10 resize-y leading-relaxed"
              />
              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span>{text.trim().length < 3 ? 'Минимум 3 символа' : `Символов: ${text.length}`}</span>
              </div>
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
              disabled={loading || text.trim().length < 3}
              onClick={submit}
              className={[
                'h-11 rounded-2xl border px-4 font-semibold transition',
                'border-black/15 bg-black text-white hover:opacity-90',
                (loading || text.trim().length < 3) ? 'opacity-50 cursor-not-allowed hover:opacity-50' : '',
              ].join(' ')}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Отправляю…
                </span>
              ) : (
                'Отправить отзыв'
              )}
            </button>

            <div className="text-xs text-neutral-500">
              Если не залогинен — сервер вернёт <code className="px-1.5 py-0.5 rounded-lg border border-black/10 bg-black/5">401</code>.
            </div>
          </div>
        </div>

        {/* List */}
        <div className="rounded-3xl border border-black/10 bg-white/80 shadow-lg overflow-hidden">
          <div className="border-b border-black/5 p-5">
            <h3 className="text-lg font-semibold tracking-tight">Опубликованные отзывы</h3>
            <p className="mt-1 text-sm text-neutral-500">Показываются только одобренные отзывы.</p>
          </div>

          <div className="p-5 grid gap-3">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-black/20 bg-white/60 p-6 text-center">
                <div className="text-2xl">💬</div>
                <div className="mt-2 font-semibold">Пока нет опубликованных отзывов</div>
                <div className="mt-1 text-sm text-neutral-500">Оставьте первый — он появится после модерации.</div>
              </div>
            ) : (
              reviews.map((r) => (
                <article
                  key={r.id}
                  className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-11 w-11 rounded-2xl overflow-hidden border border-black/10 bg-black/5 grid place-items-center shrink-0">
                        {r.avatarUrl ? (
                          <img
                            src={r.avatarUrl}
                            alt={r.authorName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-semibold text-neutral-700">
                            {(r.authorName || '?').trim().slice(0, 1).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold truncate">{r.authorName}</div>
                        <div className="text-xs text-neutral-500">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 rounded-2xl border border-black/10 bg-white px-3 py-2 text-right">
                      <div className="text-sm tracking-[0.2em] text-neutral-800">
                        {'★★★★★'.slice(0, r.rating)}
                        <span className="opacity-30">{'★★★★★'.slice(r.rating)}</span>
                      </div>
                      <div className="text-xs text-neutral-500">{r.rating}/5</div>
                    </div>
                  </div>

                  <div className="mt-3 text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap">
                    {r.text}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
