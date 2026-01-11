'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type MeUser = {
  id: string
  fullName: string
  email: string
  role: 'USER' | 'ADMIN'
}

type MeResponse = {
  user: MeUser | null
}

const serviceOptions = [
  'Дизайн с нуля',
  'Верстка',
  'Упаковка бренда',
  'Поддержка и администрирование',
  'Редизайн',
  'Обучение',
  'Другое',
]

export default function ContactsPage() {
  const router = useRouter()
  const [me, setMe] = useState<MeUser | null>(null)
  const [loadingMe, setLoadingMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [description, setDescription] = useState('')
  const [consent, setConsent] = useState(false)

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, '')
    if (!digits) return ''

    let rest = digits
    if (rest.startsWith('7') || rest.startsWith('8')) {
      rest = rest.slice(1)
    }
    rest = rest.slice(0, 10)

    let result = '+7'
    if (rest.length > 0) result += ` (${rest.slice(0, 3)}`
    if (rest.length >= 3) result += ')'
    if (rest.length > 3) result += ` ${rest.slice(3, 6)}`
    if (rest.length > 6) result += `-${rest.slice(6, 8)}`
    if (rest.length > 8) result += `-${rest.slice(8, 10)}`
    return result
  }

  useEffect(() => {
    ;(async () => {
      setLoadingMe(true)
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' })
        const data = (await res.json().catch(() => ({ user: null }))) as MeResponse
        setMe(data.user ?? null)
        if (data.user?.fullName) {
          setFullName((prev) => (prev ? prev : data.user!.fullName))
        }
      } catch {
        setMe(null)
      } finally {
        setLoadingMe(false)
      }
    })()
  }, [])

  const isAuthed = Boolean(me)
  const isDisabled = !isAuthed || loading

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMsg(null)

    if (!isAuthed) {
      setMsg({ type: 'err', text: 'Войдите, чтобы отправить заявку.' })
      return
    }

    const phoneDigits = phone.replace(/\D/g, '')

    if (!fullName.trim() || !phone.trim() || !serviceType.trim()) {
      setMsg({ type: 'err', text: 'Заполните имя, телефон и услугу.' })
      return
    }

    if (phoneDigits.length < 11) {
      setMsg({ type: 'err', text: 'Введите телефон полностью.' })
      return
    }

    if (!consent) {
      setMsg({ type: 'err', text: 'Подтвердите согласие с политикой.' })
      return
    }

    setLoading(true)

    const payloadDescription = [
      description.trim() ? description.trim() : 'Без описания',
      `Телефон: ${phone.trim()}`,
    ].join('\n')

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          serviceType: serviceType.trim(),
          description: payloadDescription,
          fullName: fullName.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setMsg({ type: 'err', text: data?.error || 'Ошибка отправки' })
        return
      }

      setMsg({ type: 'ok', text: 'Заявка отправлена! Мы скоро свяжемся.' })
      setDescription('')
      setPhone('')
      setServiceType('')
    } catch {
      setMsg({ type: 'err', text: 'Ошибка сети. Попробуйте ещё раз.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contacts" className="relative overflow-hidden">
      <div className="mx-auto w-[80%] px-6 py-16">
        <div className="">
          <div className="text-[72px] font-semibold uppercase text-[#EBEBEB] text-right leading-none sm:text-[120px]">
            контакты
          </div>
          <div>
            <h1 className="text-4xl font-semibold text-[#252525] sm:text-5xl">
              Готовы начать взаимодействие?
            </h1>
          </div>

        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden  bg-[#252525] text-white shadow-[0_24px_30px_rgba(0,0,0,0.2)]"
          >

            <div className="absolute inset-y-0 left-0 w-16 bg-[repeating-linear-gradient(to_bottom,rgba(255,255,255,0.4)_0_2px,transparent_2px_8px)]" />

            <div className="relative grid gap-6 p-8 pl-20">
              <div className="flex flex-wrap items-end gap-6">
                <div className="text-6xl font-semibold leading-none">ДА</div>
                <p className="max-w-sm text-sm text-white/70">
                  Заполните форму ниже и расскажите о своём проекте
                </p>
              </div>

              <div className="grid gap-4">
                <label className="grid gap-2 text-sm text-white/70">
                  Имя
                  <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ваше имя"
                    disabled={isDisabled}
                    className="w-full bg-transparent pb-2 text-sm text-white placeholder:text-white/40 outline-none border-b border-white/30 focus:border-white"
                  />
                </label>

                <label className="grid gap-2 text-sm text-white/70">
                  Номер телефона
                  <input
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    placeholder="+7 (___) ___-__-__"
                    type="tel"
                    inputMode="tel"
                    disabled={isDisabled}
                    className="w-full bg-transparent pb-2 text-sm text-white placeholder:text-white/40 outline-none border-b border-white/30 focus:border-white"
                  />
                </label>

                <label className="grid gap-2 text-sm text-white/70">
                  Выберите вид услуги
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    disabled={isDisabled}
                    className="w-full bg-transparent pb-2 text-sm text-white outline-none border-b border-white/30 focus:border-white"
                  >
                    <option value="" disabled className="text-black">
                      Выберите услугу
                    </option>
                    {serviceOptions.map((option) => (
                      <option key={option} value={option} className="text-black">
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-2 text-sm text-white/70">
                  Опишите кратко проект (не обязательно)
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    placeholder="Коротко о задаче"
                    disabled={isDisabled}
                    className="w-full resize-none bg-transparent pb-2 text-sm text-white placeholder:text-white/40 outline-none border-b border-white/30 focus:border-white"
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 text-xs text-white/60">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  disabled={isDisabled}
                  className="mt-0.5 h-4 w-4 rounded border-white/40 bg-transparent"
                />
                <span>
                  Я согласен с{' '}
                  <a href="/privacy" className="underline underline-offset-4 !hover:text-red-700">политикой конфиденциальности</a>
                </span>
              </label>

              {msg && (
                <div
                  className={[
                    'rounded-2xl border px-4 py-3 text-sm',
                    msg.type === 'ok'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                      : 'border-rose-500/30 bg-rose-500/10 text-rose-100',
                  ].join(' ')}
                >
                  {msg.text}
                </div>
              )}

              {!isAuthed && !loadingMe && (
                <div className="text-xs text-amber-200">
                  Чтобы отправить заявку, нужно войти в аккаунт.
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={isDisabled || !consent}
                  className="rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? 'Отправляю…' : 'Оставить заявку'}
                </button>
                {!isAuthed && !loadingMe && (
                  <button
                    type="button"
                    onClick={() => router.push('/login')}
                    className="rounded-full border border-white/20 px-5 py-3 text-sm text-white/80 transition hover:text-white"
                  >
                    Войти
                  </button>
                )}
              </div>
            </div>
          </form>

          <aside className="border border-black/10 bg-white p-8 shadow-[0_18px_50px_rgba(0,0,0,0.08)]">
            <h2 className="text-2xl font-semibold text-[#252525]">СОМНЕВАЕТЕСЬ?</h2>
            <p className="mt-3 text-sm text-neutral-600">
              Мы всегда открыты к диалогу в удобной для вас форме
            </p>

            <div className="mt-8 flex items-center gap-4">
              <a
                href="https://t.me"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#252525] text-sm font-semibold text-white"
                aria-label="Telegram"
              >
                <span className="text-white">TG</span>
              </a>
              <a
                href="https://wa.me"
                className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#252525] text-sm font-semibold text-white"
                aria-label="WhatsApp"
              >
                <span className="text-white">WA</span>
              </a>
            </div>

            <div className="mt-8 text-sm text-neutral-500">Контакты для связи:</div>
            <div className="mt-3 text-lg font-semibold text-[#B5292A]">
              +7 (928) 628-21-04
            </div>
            <div className="text-lg text-[#B5292A]">team@disign-hope.ru</div>
          </aside>
        </div>
      </div>
    </section>
  )
}
