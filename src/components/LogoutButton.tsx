'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { withCsrfHeaders } from '@/src/lib/csrf-client'

type LogoutButtonProps = {
  className?: string
  children?: React.ReactNode
  redirectTo?: string
}

export default function LogoutButton({
  className,
  children = 'Выйти',
  redirectTo = '/login',
}: LogoutButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    if (loading) return
    setLoading(true)

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: withCsrfHeaders(),
      })
    } finally {
      router.push(redirectTo)
      router.refresh()
    }
  }

  const base =
    'inline-flex items-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50'
  const cls = className ? `${base} ${className}` : base

  return (
    <button type="button" onClick={handleLogout} disabled={loading} className={cls}>
      {loading ? 'Выход…' : children}
    </button>
  )
}
