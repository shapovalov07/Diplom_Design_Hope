import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'

export const runtime = 'nodejs'

export async function PATCH(req: Request) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => null)

    const fullName = String(body?.fullName || '').trim()
    const email = String(body?.email || '').trim().toLowerCase()
    const fullNameParts = fullName.split(/\s+/).filter(Boolean)

    if (!fullName || !email) {
      return NextResponse.json({ error: 'Заполните имя и email' }, { status: 400 })
    }
    if (fullNameParts.length < 2) {
      return NextResponse.json({ error: 'Укажите фамилию и имя' }, { status: 400 })
    }

    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 400 })
    }

    const exists = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: user.id },
      },
      select: { id: true },
    })

    if (exists) {
      return NextResponse.json({ error: 'Почта уже используется' }, { status: 409 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { fullName, email },
      select: { id: true, fullName: true, email: true, role: true },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}
