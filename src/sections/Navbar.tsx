'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

type MeUser = {
  id: string
  fullName: string
  email: string
  role: 'USER' | 'ADMIN'
}
type MeResponse = { user: MeUser | null }

export default function Header() {
  const pathname = usePathname()
  const [me, setMe] = useState<MeUser | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadMe() {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include', cache: 'no-store' })
      const data = (await res.json().catch(() => ({ user: null }))) as MeResponse
      setMe(data.user ?? null)
    } catch {
      setMe(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMe()
  }, [pathname])

  const authedHref = me?.role === 'ADMIN' ? '/admin' : '/profile'

  return (
    <header className="flex justify-between items-center my-5 rounded-lg">
      <div className="w-[80%] flex m-auto justify-between items-center">
        <div className="px-[4%] flex bg-white w-[70%] h-[60px] justify-between rounded-full items-center">
          <Link href="/">
            <Image src="/logo.svg" alt="Дизайн HOPE" width={150} height={100} />
          </Link>

          <nav>
            <ul className="flex gap-6">
              <li className='hover:text-[#B5292A] duration-300'><a href="/service" className="font-light text-lg text-[#B5292A]">услуги</a></li>
              <li className='hover:text-[#B5292A] duration-300'><a href="/portfolio" className="font-light hover:text-[#B5292A] text-lg">портфолио</a></li>
              <li className='hover:text-[#B5292A] duration-300'><a href="/about" className="font-light hover:text-[#B5292A] text-lg">о нас</a></li>
              <li className='hover:text-[#B5292A] duration-300'><a href="/contacts" className="font-light hover:text-[#B5292A] text-lg">контакты</a></li>
            </ul>
          </nav>
        </div>

        <div className="flex gap-4 items-center">
          <a href="https://t.me" className="block hover:scale-110 duration-300">
            <Image src="/tg.svg" alt="Telegram" width={50} height={50} />
          </a>
          <a href="https://vk.com" className="block hover:scale-110 duration-300">
            <Image src="/vk.svg" alt="VK" width={50} height={50} />
          </a>

          {loading ? (
            <div className="ml-2 h-[50px] w-[50px] rounded-full bg-[#252525] animate-pulse" />
          ) : !me ? (
            <Link
              href="/login"
              className="inline-flex h-[50px] items-center justify-center rounded-full bg-[#252525] px-6 text-sm font-semibold !text-white hover:scale-110 duration-300 transition"
            >
              Войти
            </Link>
          ) : (
            <Link
              href={authedHref}
              title={me.role === 'ADMIN' ? 'Админка' : 'Профиль'}
              className="inline-flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#252525] !text-white hover:scale-110 duration-300 transition">
              <Image src="/profile.svg" alt="VK" width={50} height={50} />
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
