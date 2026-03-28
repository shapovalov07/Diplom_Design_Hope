'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import StarRating from '@/src/components/StarRating'
import { withCsrfHeaders } from '@/src/lib/csrf-client'
import { formatRating } from '@/src/lib/rating'

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
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const closeTimerRef = useRef<number | null>(null)
  const [startIndex, setStartIndex] = useState(0)
  const [expandedIds, setExpandedIds] = useState<string[]>([])

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
    setHoverRating(null)
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
      headers: withCsrfHeaders({ 'Content-Type': 'application/json' }),
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
    setRating(5)
    setHoverRating(null)
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

  function toggleReview(id: string) {
    setExpandedIds((prev) => (
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    ))
  }

  const previewLimit = 200
  const displayRating = hoverRating ?? rating

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
            {avgRating ? `${formatRating(avgRating)}/5` : '—/5'}
          </span>
          <span className="text-yellow-400 text-lg">★</span>
          <span className="font-semibold text-neutral-900">Отзывы клиентов</span>
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
              (() => {
                const isLong = r.text.length > previewLimit
                const isExpanded = expandedIds.includes(r.id)
                const displayText = isLong && !isExpanded
                  ? `${r.text.slice(0, previewLimit).trimEnd()}...`
                  : r.text

                return (
              <article
                key={r.id}
                className={[
                  'group relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6',
                  'shadow-[0_14px_40px_rgba(0,0,0,0.08)] transition hover:-translate-y-1 hover:shadow-[0_22px_60px_rgba(0,0,0,0.12)]',
                  "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[linear-gradient(90deg,#B5292A_0%,#E1A34B_60%,rgba(0,0,0,0)_100%)] before:content-['']",
                  isLong ? 'cursor-pointer' : '',
                ].join(' ')}
                onClick={isLong ? () => toggleReview(r.id) : undefined}
                onKeyDown={isLong ? (event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    toggleReview(r.id)
                  }
                } : undefined}
                role={isLong ? 'button' : undefined}
                tabIndex={isLong ? 0 : undefined}
                aria-expanded={isLong ? isExpanded : undefined}
              >
                <div className="flex items-center gap-3">
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
                <div className="mt-4 flex items-center gap-3">
                  <StarRating value={r.rating} starClassName="h-5 w-5" />
                  <span className="text-sm text-neutral-500">{formatRating(r.rating)}/5</span>
                </div>
                <div className="mt-4 rounded-2xl bg-black/[0.04] p-4">
                  <p className="text-sm leading-relaxed text-neutral-700 break-words whitespace-pre-wrap">
                    {displayText}
                  </p>
                </div>
                {isLong && (
                  <div className="mt-3 text-xs text-neutral-500">
                    {isExpanded ? 'Свернуть' : 'Читать полностью'}
                  </div>
                )}
              </article>
                )
              })()
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
                  <div className="flex flex-wrap items-center gap-4">
                    <div
                      className="flex items-center gap-1"
                      role="radiogroup"
                      aria-label="Оценка"
                      onMouseLeave={() => setHoverRating(null)}
                      onBlur={(event) => {
                        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          setHoverRating(null)
                        }
                      }}
                    >
                      <div className="relative">
                        <StarRating value={displayRating} starClassName="h-8 w-8" className="pointer-events-none" />
                        <div className="absolute inset-0 flex items-stretch gap-1">
                          {Array.from({ length: 5 }, (_, index) => {
                            const leftValue = index + 0.5
                            const rightValue = index + 1

                            return (
                              <div key={rightValue} className="relative h-8 w-8 shrink-0">
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={rating === leftValue}
                                  aria-label={`${formatRating(leftValue)} из 5`}
                                  onClick={() => setRating(leftValue)}
                                  onMouseEnter={() => setHoverRating(leftValue)}
                                  onFocus={() => setHoverRating(leftValue)}
                                  className="absolute inset-y-0 left-0 z-10 w-1/2 rounded-l-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                                />
                                <button
                                  type="button"
                                  role="radio"
                                  aria-checked={rating === rightValue}
                                  aria-label={`${formatRating(rightValue)} из 5`}
                                  onClick={() => setRating(rightValue)}
                                  onMouseEnter={() => setHoverRating(rightValue)}
                                  onFocus={() => setHoverRating(rightValue)}
                                  className="absolute inset-y-0 right-0 z-10 w-1/2 rounded-r-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-400"
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-neutral-500" aria-live="polite">
                      {formatRating(displayRating)} из 5
                    </div>
                    <span className="text-sm text-neutral-600">{formatRating(rating)}/5</span>
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
                  Войдите в аккаунт и оставьте пару честных строк о работе с нами.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
