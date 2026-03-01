'use client'

import { useEffect, useState } from 'react'

type Item = {
  id: string
  title: string
  projectUrl: string
  description: string | null
  coverImageUrl: string | null
  createdAt: string
}

type PortfolioSectionProps = {
  limit?: number
  showAllLink?: boolean
  allLinkHref?: string
  allLinkLabel?: string
}

export default function PortfolioSection({
  limit,
  showAllLink = false,
  allLinkHref = '/portfolio',
  allLinkLabel = 'Все портфолио',
}: PortfolioSectionProps) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const res = await fetch('/api/portfolio', { cache: 'no-store' })
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text ? `HTTP ${res.status}: ${text}` : `HTTP ${res.status}`)
        }
        const data = (await res.json()) as { items?: Item[] }
        if (!active) return
        setItems(Array.isArray(data.items) ? data.items : [])
        setError(null)
      } catch (fetchError) {
        console.error('Portfolio API error:', fetchError)
        if (!active) return
        setItems([])
        setError('Не удалось загрузить портфолио.')
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const visibleItems = limit ? items.slice(0, limit) : items

  return (
    <section className="relative w-[80%] m-auto px-6 py-12">
      <div>
        <h1 className="text-right text-[128px] leading-none text-[#D9D9D9]">
          ПОРТФОЛИО
        </h1>
        <h2 className="text-3xl font-semibold tracking-tight">
          Наши последние работы
        </h2>
      </div>

      <div className="relative mt-10">
        {loading ? (
          <div className="text-sm text-neutral-500">Загрузка…</div>
        ) : error ? (
          <div className="text-sm text-rose-600">{error}</div>
        ) : visibleItems.length === 0 ? (
          <div className="text-sm text-neutral-500">Пока нет опубликованных работ.</div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2">
            {visibleItems.map((item) => (
              <a
                key={item.id}
                href={item.projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group block"
              >
                <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_70px_rgba(0,0,0,0.10)]">
                  <div className="relative aspect-[16/9] bg-black/5">
                    {item.coverImageUrl ? (
                      <img
                        src={item.coverImageUrl}
                        alt={item.title}
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
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="mt-3 line-clamp-2 text-sm text-neutral-600">
                          {item.description}
                        </p>
                      )}

                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
        {showAllLink && !loading && !error && (
          <div className="mt-10 flex justify-center">
            <a
              href={allLinkHref}
              className="rounded-full bg-[#B5292A] px-6 py-3 text-base font-light !text-white transition hover:scale-[1.05] duration-600"
            >
              {allLinkLabel}
            </a>
          </div>
        )}
      </div>
    </section>
  )
}
