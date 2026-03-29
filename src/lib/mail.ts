import nodemailer from 'nodemailer'
import { PASSWORD_RESET_TOKEN_TTL_MINUTES } from '@/src/lib/password-reset'

class MailConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MailConfigError'
  }
}

type SendPasswordResetEmailParams = {
  to: string
  firstName: string
  resetUrl: string
}

type SendPasswordResetEmailResult = {
  previewUrl?: string
  provider: 'smtp' | 'resend' | 'preview'
}

function canUseLocalPreviewFallback() {
  if (process.env.MAIL_PREVIEW_LOCAL === '1') return true

  const baseUrl = process.env.APP_BASE_URL?.trim()
  if (!baseUrl) return process.env.NODE_ENV !== 'production'

  try {
    const url = new URL(baseUrl)
    return ['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)
  } catch {
    return process.env.NODE_ENV !== 'production'
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function readMailContent(firstName: string, resetUrl: string) {
  const safeName = escapeHtml(firstName || 'пользователь')
  const safeUrl = escapeHtml(resetUrl)
  const subject = 'Восстановление пароля'
  const text = [
    `Здравствуйте, ${firstName || 'пользователь'}!`,
    '',
    'Вы запросили восстановление пароля.',
    `Ссылка действует ${PASSWORD_RESET_TOKEN_TTL_MINUTES} минут:`,
    resetUrl,
    '',
    'Если это были не вы, просто проигнорируйте письмо.',
  ].join('\n')
  const html = [
    `<p>Здравствуйте, ${safeName}!</p>`,
    '<p>Вы запросили восстановление пароля.</p>',
    `<p>Ссылка действует ${PASSWORD_RESET_TOKEN_TTL_MINUTES} минут:</p>`,
    `<p><a href="${safeUrl}">${safeUrl}</a></p>`,
    '<p>Если это были не вы, просто проигнорируйте письмо.</p>',
  ].join('')

  return { subject, text, html }
}

function readPositivePort(raw: string | undefined, fallback: number) {
  const parsed = Number.parseInt(String(raw ?? ''), 10)
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback
  return parsed
}

function readSecureFlag(raw: string | undefined, fallback: boolean) {
  if (!raw) return fallback
  return ['1', 'true', 'yes', 'on'].includes(raw.trim().toLowerCase())
}

async function sendViaSmtp({
  to,
  from,
  firstName,
  resetUrl,
}: {
  to: string
  from: string
  firstName: string
  resetUrl: string
}) {
  const host = process.env.SMTP_HOST?.trim()
  const user = process.env.SMTP_USER?.trim()
  const pass = process.env.SMTP_PASS?.trim()

  if (!host || !user || !pass) {
    return false
  }

  const port = readPositivePort(process.env.SMTP_PORT, 465)
  const secure = readSecureFlag(process.env.SMTP_SECURE, port === 465)
  const { subject, text, html } = readMailContent(firstName, resetUrl)

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  })

  return true
}

async function sendViaResend({
  to,
  from,
  firstName,
  resetUrl,
}: {
  to: string
  from: string
  firstName: string
  resetUrl: string
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) {
    return false
  }

  const { subject, text, html } = readMailContent(firstName, resetUrl)

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      text,
      html,
    }),
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`Mail delivery failed: ${response.status} ${body}`.trim())
  }

  return true
}

export async function sendPasswordResetEmail({
  to,
  firstName,
  resetUrl,
}: SendPasswordResetEmailParams): Promise<SendPasswordResetEmailResult> {
  const from = process.env.MAIL_FROM?.trim() || process.env.SMTP_USER?.trim()

  if (!from) {
    if (canUseLocalPreviewFallback()) {
      console.info(`[password-reset] ${to}: ${resetUrl}`)
      return { previewUrl: resetUrl, provider: 'preview' }
    }

    throw new MailConfigError('MAIL_FROM or SMTP_USER is not configured')
  }

  if (await sendViaSmtp({ to, from, firstName, resetUrl })) {
    return { provider: 'smtp' }
  }

  if (await sendViaResend({ to, from, firstName, resetUrl })) {
    return { provider: 'resend' }
  }

  if (canUseLocalPreviewFallback()) {
    console.info(`[password-reset] ${to}: ${resetUrl}`)
    return { previewUrl: resetUrl, provider: 'preview' }
  }

  throw new MailConfigError('Mail transport is not configured')
}
