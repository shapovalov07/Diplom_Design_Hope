type TelegramPayload = {
  chat_id: string
  text: string
  message_thread_id?: number
}

export async function sendTelegramMessage(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[telegram] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы')
    }
    return
  }

  const payload: TelegramPayload = { chat_id: chatId, text }
  const threadId = process.env.TELEGRAM_THREAD_ID

  if (threadId && Number.isFinite(Number(threadId))) {
    payload.message_thread_id = Number(threadId)
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!res.ok && process.env.NODE_ENV !== 'production') {
      const body = await res.text().catch(() => '')
      console.warn('[telegram] sendMessage failed:', res.status, body)
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[telegram] sendMessage error:', err)
    }
  }
}
