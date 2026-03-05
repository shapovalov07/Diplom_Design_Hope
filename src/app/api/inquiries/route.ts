import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'
import { ApiAuthError, requireApiUser } from '@/src/lib/auth'
import { sendTelegramMessage } from '@/src/lib/telegram'
import {
  checkRateLimit,
  csrfErrorResponse,
  hasValidCsrfToken,
  rateLimitErrorResponse,
} from '@/src/lib/security'

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
  const rl = checkRateLimit(req, {
    bucket: 'inquiries:create',
    limit: 8,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    const user = await requireApiUser()
    if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()
    const body = await req.json().catch(() => null)
    const serviceType = String(body?.serviceType ?? '').trim()
    const description = String(body?.description ?? '').trim()
    const fullName = String(body?.fullName ?? '').trim()

    if (!serviceType || !description) {
      return NextResponse.json({ error: 'Заполните поля' }, { status: 400 })
    }
    if (serviceType.length < 2 || serviceType.length > 80) {
      return NextResponse.json({ error: 'Некорректная услуга' }, { status: 400 })
    }
    if (description.length < 5 || description.length > 3000) {
      return NextResponse.json({ error: 'Некорректное описание' }, { status: 400 })
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
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
