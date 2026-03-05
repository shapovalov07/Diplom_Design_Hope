import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { ApiAuthError, requireApiAdmin } from '@/src/lib/auth'
import {
  checkRateLimit,
  csrfErrorResponse,
  hasValidCsrfToken,
  rateLimitErrorResponse,
} from '@/src/lib/security'

export const runtime = 'nodejs' // важно: чтобы работал fs

const MAX_SIZE_MB = 8
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

function detectImageType(bytes: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (bytes.length < 12) return null

  const isPng =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  if (isPng) return 'png'

  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (isJpeg) return 'jpg'

  const isWebp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  if (isWebp) return 'webp'

  return null
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, {
    bucket: 'upload:create',
    limit: 60,
    windowMs: 60 * 60 * 1000,
  })
  if (rl.limited) return rateLimitErrorResponse(rl.retryAfterSec)

  try {
    await requireApiAdmin()
  } catch (error) {
    if (error instanceof ApiAuthError) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }

  if (!(await hasValidCsrfToken(req))) return csrfErrorResponse()

  const form = await req.formData()
  const file = form.get('file')

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не найден (file)' }, { status: 400 })
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Разрешены только JPG/PNG/WebP' }, { status: 400 })
  }

  const sizeMb = file.size / (1024 * 1024)
  if (sizeMb > MAX_SIZE_MB) {
    return NextResponse.json({ error: `Файл слишком большой (>${MAX_SIZE_MB}MB)` }, { status: 400 })
  }

  const bytes = Buffer.from(await file.arrayBuffer())
  const detected = detectImageType(bytes)
  if (!detected) {
    return NextResponse.json({ error: 'Файл не похож на изображение' }, { status: 400 })
  }

  const filename = `${crypto.randomUUID()}.${detected}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, bytes)

  // URL, который можно сохранить в БД
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 })
}
