'use client'

import { useEffect, useState } from 'react'
import InquiryChat from '@/src/components/InquiryChat'

type Inquiry = {
  id: string
  serviceType: string
  description: string
  status: 'NEW' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
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

export default function ProfileInquiries({ currentUserId }: { currentUserId: string }) {
  const [items, setItems] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(false)
  const [openChatId, setOpenChatId] = useState<string | null>(null)

  async function load() {
    setLoading(true)

    const res = await fetch('/api/inquiries', {
      cache: 'no-store',
      credentials: 'include',
    })

    const raw = await res.text()
    let data: any = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      setItems([])
      setLoading(false)
      return
    }

    setItems(Array.isArray(data?.inquiries) ? data.inquiries : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <div className="reveal-up [--delay:140ms] overflow-hidden rounded-[32px] border border-black/10 bg-[#F2F2F2] text-sm text-neutral-700 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-white px-6 py-5">
        <div>
          <h2 className="text-2xl font-semibold text-[#252525]">Заявки и чат</h2>
        </div>
        <button
          onClick={load}
          className="rounded-full border border-black/15 px-4 py-2 text-xs font-semibold text-neutral-900 transition hover:bg-neutral-50"
          type="button"
        >
          Обновить
        </button>
      </div>

      <div className="card-stripe">
        <div className="grid gap-4 p-6 pl-12">
          {loading ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-6 text-center text-sm text-neutral-600">
              Загрузка…
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-black/15 bg-white/70 p-6 text-center text-sm text-neutral-600">
              Заявок пока нет.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-black/10 bg-white p-5 shadow-[0_10px_30px_rgba(0,0,0,0.08)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold text-neutral-900">{item.serviceType}</div>
                      <StatusBadge status={item.status} />
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOpenChatId(openChatId === item.id ? null : item.id)}
                      className={[
                        'rounded-full px-4 py-2 text-xs font-semibold transition',
                        openChatId === item.id
                          ? 'border border-black/15 text-neutral-900 hover:bg-neutral-50'
                          : 'bg-[#252525] text-white hover:opacity-90',
                      ].join(' ')}
                      type="button"
                    >
                      {openChatId === item.id ? 'Скрыть чат' : 'Открыть чат'}
                    </button>
                  </div>
                </div>

                <div className="mt-3 whitespace-pre-wrap text-sm text-neutral-600">
                  {item.description}
                </div>

                {openChatId === item.id && (
                  <InquiryChat inquiryId={item.id} currentUserId={currentUserId} />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
