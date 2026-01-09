import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { serviceType, description, fullName } = await req.json()

    if (!serviceType || !description) {
      return NextResponse.json({ error: 'Заполните поля' }, { status: 400 })
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        serviceType,
        description,
        fullName: fullName || user.fullName,
      },
    })

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}
