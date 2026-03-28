'use client'

import { useEffect, useState } from 'react'
import { formatUserFullName } from '@/src/lib/user-name'

type ChatMessage = {
  id: string
  text: string
  createdAt: string
  author: {
    id: string
    lastName: string
    firstName: string
    middleName: string
    role: 'USER' | 'ADMIN'
  }
}

export default function InquiryChat({
  inquiryId,
  currentUserId,
}: {
  inquiryId: string
  currentUserId: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function formatTimestamp(value: string) {
    const date = new Date(value)
    const day = date.toLocaleDateString()
    const time = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return `${day} ${time}`
  }

  async function load() {
    setLoading(true)
    setError(null)

    const res = await fetch(`/api/inquiries/${inquiryId}/messages`, {
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
      setError(data?.error || 'Ошибка загрузки сообщений')
      setLoading(false)
      return
    }

    setMessages(Array.isArray(data?.messages) ? data.messages : [])
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [inquiryId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed || sending) return

    setSending(true)
    setError(null)

    const res = await fetch(`/api/inquiries/${inquiryId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: trimmed }),
    })

    const raw = await res.text()
    let data: any = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = null
    }

    if (!res.ok) {
      setError(data?.error || 'Ошибка отправки сообщения')
      setSending(false)
      return
    }

    if (data?.message) {
      setMessages((prev) => [...prev, data.message])
    }

    setText('')
    setSending(false)
  }

  return (
    <div className="mt-3 rounded-2xl border border-black/10 bg-neutral-50 p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-neutral-600">Чат</div>
        <button
          onClick={load}
          className="text-xs font-semibold text-neutral-900 underline decoration-black/20 underline-offset-4 hover:decoration-black/40"
          type="button"
        >
          Обновить
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {loading ? (
          <div className="text-xs text-neutral-500">Загрузка…</div>
        ) : messages.length === 0 ? (
          <div className="text-xs text-neutral-500">Сообщений пока нет.</div>
        ) : (
          messages.map((message) => {
            const isMine = message.author.id === currentUserId
            return (
              <div
                key={message.id}
                className={[
                  'rounded-2xl px-3 py-2 text-sm shadow-sm',
                  isMine
                    ? 'ml-auto max-w-[85%] sm:max-w-[50%] bg-white text-neutral-900 border border-black/10'
                    : 'max-w-[85%] sm:max-w-[50%] bg-white text-neutral-900 border border-black/10',
                ].join(' ')}
              >
                <div className="text-[11px] text-neutral-500">
                  {formatUserFullName(message.author)} · {formatTimestamp(message.createdAt)}
                </div>
                <div className="mt-1 whitespace-pre-wrap leading-relaxed">
                  {message.text}
                </div>
              </div>
            )
          })
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
          placeholder="Напишите сообщение..."
          className="min-h-[60px] flex-1 rounded-xl border border-black/15 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-black/40"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="h-[60px] rounded-xl bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Отправить
        </button>
      </form>
    </div>
  )
}
