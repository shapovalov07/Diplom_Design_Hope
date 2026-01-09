'use client'

import { useEffect, useState } from 'react'

type Item = {
  id: string
  title: string
  slug: string
  description: string | null
  coverImageUrl: string | null
  tags: string[]
  createdAt: string
}

export default function PortfolioSection() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/portfolio', { cache: 'no-store' })
      const data = await res.json()
      setItems(data.items || [])
      setLoading(false)
    })()
  }, [])

  return (
    <section className="relative">
      {/* Большой фон-надпись как на примере */}
      <div className="pointer-events-none absolute -top-6 right-0 hidden select-none lg:block">
        <div className="text-[96px] font-extrabold tracking-tight text-black/[0.04]">
          ПОРТФОЛИО
        </div>
      </div>

      <div className="relative">
        <h2 className="text-3xl font-semibold tracking-tight">Наши последние работы</h2>

        <div className="mt-10">
          {loading ? (
            <div className="text-sm text-neutral-500">Загрузка…</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-neutral-500">Пока нет опубликованных работ.</div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2">
              {items.map((item) => (
                <a
                  key={item.id}
                  href={`/portfolio/${item.slug}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition hover:shadow-[0_18px_70px_rgba(0,0,0,0.10)]">
                    {/* Картинка */}
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

                      {/* лёгкая градиентная подложка снизу */}
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition group-hover:opacity-100" />
                    </div>

                    {/* Текст под карточкой как на фото */}
                    <div className="px-5 pb-5">
                      <div className="px-1 pt-4">
                        <h3 className="text-lg font-semibold leading-snug tracking-tight">
                          {item.title}
                        </h3>

                        {/* Теги как хэштеги */}
                        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-neutral-500">
                          {(item.tags || []).slice(0, 4).map((t) => (
                            <span key={t}>#{t}</span>
                          ))}
                        </div>

                        {/* опционально: описание */}
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
        </div>
      </div>
    </section>
  )
}
