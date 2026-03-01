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

    const inquiry = await prisma.inquiry.create({
      data: {
        userId: user.id,
        serviceType,
        description,
        fullName: fullName ? fullName.slice(0, 120) : user.fullName,
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
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'Требуется вход' }, { status: 401 })
    }

    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
