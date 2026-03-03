import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { requireUser } from '@/src/lib/auth'
import { sendTelegramMessage } from '@/src/lib/telegram'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const user = await requireUser()
    const inquiries = await prisma.inquiry.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        serviceType: true,
        description: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ inquiries })
  } catch {
    return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const { serviceType, description, fullName } = await req.json()

    if (!serviceType || !description) {
      return NextResponse.json({ error: 'Заполните поля' }, { status: 400 })
    }

    const trimmedService = String(serviceType).trim()
    const trimmedDescription = String(description).trim()

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        serviceType: trimmedService,
        description: trimmedDescription,
        fullName: fullName ? String(fullName).trim() : user.fullName,
      },
    })

    await prisma.inquiryMessage.create({
      data: {
        inquiryId: inquiry.id,
        authorId: user.id,
        text: trimmedDescription,
      },
    })

    await sendTelegramMessage(
      [
        '📬 Новая заявка',
        `Имя: ${inquiry.fullName}`,
        `Почта: ${user.email}`,
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
