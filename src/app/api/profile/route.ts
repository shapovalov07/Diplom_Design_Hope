import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'
import { normalizeUserNameFields } from '@/src/lib/user-name'

export const runtime = 'nodejs'

export async function PATCH(req: Request) {
  try {
    const user = await requireUser()
    const body = await req.json().catch(() => null)

    const { lastName, firstName, middleName } = normalizeUserNameFields({
      lastName: body?.lastName,
      firstName: body?.firstName,
      middleName: body?.middleName,
    })
    const email = String(body?.email || '').trim().toLowerCase()

    if (!lastName || !firstName || !email) {
      return NextResponse.json({ error: 'Заполните фамилию, имя и email' }, { status: 400 })
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
      data: { lastName, firstName, middleName, email },
      select: { id: true, lastName: true, firstName: true, middleName: true, email: true, role: true },
    })

    return NextResponse.json({ user: updated })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}
