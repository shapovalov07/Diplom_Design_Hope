import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'
import { sendTelegramMessage } from '@/src/lib/telegram'

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
        serviceType: String(serviceType).trim(),
        description: String(description).trim(),
        fullName: fullName ? String(fullName).trim() : user.fullName,
      },
    })

    await sendTelegramMessage(
      [
        '📬 Новая заявка',
        `Имя: ${inquiry.fullName}`,
        `Email: ${user.email}`,
        `Услуга: ${inquiry.serviceType}`,
        `Описание: ${inquiry.description}`,
        `ID: ${inquiry.id}`,
      ].join('\n'),
    )

    return NextResponse.json({ inquiry }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}
