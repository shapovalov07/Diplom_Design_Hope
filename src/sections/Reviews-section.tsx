'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const [startIndex, setStartIndex] = useState(0)

  async function load() {
    const res = await fetch('/api/reviews', { cache: 'no-store' })
    const data = await res.json()
    setReviews(data.reviews || [])
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (!isModalOpen) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeModal()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isModalOpen])

  useEffect(() => {
    if (!isModalOpen) return

    const { body } = document
    const prevOverflow = body.style.overflow
    const prevPaddingRight = body.style.paddingRight
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

    body.style.overflow = 'hidden'
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`
    }

    return () => {
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPaddingRight
    }
  }, [isModalOpen])

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  function openModal() {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsModalOpen(true)
    requestAnimationFrame(() => setIsModalVisible(true))
  }

  function closeModal() {
    setIsModalVisible(false)
    closeTimerRef.current = window.setTimeout(() => {
      setIsModalOpen(false)
      closeTimerRef.current = null
    }, 200)
  }

  useEffect(() => {
    setStartIndex(0)
  }, [reviews.length])

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

  const visibleCount = 3
  const maxIndex = Math.max(0, reviews.length - visibleCount)
  const canNavigatePrev = startIndex > 0
  const canNavigateNext = startIndex < maxIndex
  const progressPercent =
    reviews.length === 0
      ? 0
      : Math.round((Math.min(startIndex + visibleCount, reviews.length) / reviews.length) * 100)
  const visibleReviews =
    reviews.length === 0
      ? []
      : reviews.length <= visibleCount
        ? reviews
        : reviews.slice(startIndex, startIndex + visibleCount)

  function handlePrev() {
    if (!canNavigatePrev) return
    setStartIndex((prev) => Math.max(0, prev - 1))
  }

  function handleNext() {
    if (!canNavigateNext) return
    setStartIndex((prev) => Math.min(maxIndex, prev + 1))
  }

  const stars = (n: number) => '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n)

  return (
    <section className="relative">
      <div className="text-center">
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Читайте отзывы,
          <br className="hidden sm:block" />
          уверенно выбирайте.
        </h2>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm text-neutral-500">
          <span className="text-base font-semibold text-neutral-900">
            {avgRating ? `${avgRating}/5` : '—/5'}
          </span>
          <span className="text-yellow-400 text-lg">★</span>
          <span className="font-semibold text-neutral-900">HOPE Reviews</span>
          <span className="text-neutral-300">•</span>
          <span>На основе {reviews.length} отзывов</span>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[260px_1fr]">
        <div className="flex flex-col gap-6">
          <div className="text-7xl leading-none text-neutral-300">“</div>
          <div>
            <h3 className="text-2xl font-semibold">Что говорят наши клиенты</h3>
            <p className="mt-2 text-sm text-neutral-500">
              Новые отзывы появляются после модерации.
            </p>
          </div>
          <div className="flex items-center gap-3 text-neutral-400">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canNavigatePrev}
              className={[
                'h-10 w-10 rounded-full border border-black/10 bg-white text-lg transition',
                canNavigatePrev ? 'hover:text-black' : 'cursor-not-allowed opacity-40',
              ].join(' ')}
              aria-label="Предыдущий отзыв"
            >
              ←
            </button>
            <div className="h-[3px] w-24 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-black/70 transition-[width] duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleNext}
              disabled={!canNavigateNext}
              className={[
                'h-10 w-10 rounded-full border border-black/10 bg-white text-lg transition',
                canNavigateNext ? 'hover:text-black' : 'cursor-not-allowed opacity-40',
              ].join(' ')}
              aria-label="Следующий отзыв"
            >
              →
            </button>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="mt-2 inline-flex w-fit items-center rounded-full bg-[#B5292A] px-6 py-3 text-sm font-semibold text-white transition hover:scale-[1.02]"
          >
            Оставить отзыв
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleReviews.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-black/15 bg-white/80 p-8 text-center">
              <div className="text-2xl">💬</div>
              <div className="mt-2 font-semibold">Пока нет опубликованных отзывов</div>
              <div className="mt-1 text-sm text-neutral-500">
                Оставьте первый — он появится после модерации.
              </div>
            </div>
          ) : (
            visibleReviews.map((r) => (
              <article
                key={r.id}
                className="rounded-3xl border border-black/10 bg-white p-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
              >
                <p className="text-sm leading-relaxed text-neutral-700 break-words whitespace-pre-wrap">
                  {r.text}
                </p>
                <div className="mt-4 text-sm tracking-[0.2em] text-yellow-400">
                  {stars(r.rating).slice(0, r.rating)}
                  <span className="text-neutral-300">
                    {stars(r.rating).slice(r.rating)}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full overflow-hidden border border-black/10 bg-black/5 grid place-items-center shrink-0">
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
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className={[
              'absolute inset-0 bg-black/40 transition-opacity duration-200',
              isModalVisible ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
            onClick={closeModal}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="review-dialog-title"
            className={[
              'relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-black/10 bg-white shadow-2xl transition duration-200',
              isModalVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95',
            ].join(' ')}
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black/5 p-6">
              <div>
                <h3 id="review-dialog-title" className="text-xl font-semibold tracking-tight">
                  Оставить отзыв
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  Доступно только для залогиненных пользователей.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-neutral-600">
                  Модерация
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg text-neutral-600 transition hover:text-black"
                  aria-label="Закрыть"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="max-h-[80vh] overflow-y-auto p-6">
              <div className="grid gap-4">
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
                      className="text-sm tracking-[0.2em] text-yellow-400 select-none"
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
                        ? 'border-yellow-400/30 bg-yellow-400/10 text-emerald-900'
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
                  Если не залогинен — сервер вернёт{' '}
                  <code className="px-1.5 py-0.5 rounded-lg border border-black/10 bg-black/5">401</code>.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
