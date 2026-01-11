import { NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs' // важно: чтобы работал fs

const MAX_SIZE_MB = 8
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function POST(req: Request) {
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
  const ext =
    file.type === 'image/png' ? 'png' :
    file.type === 'image/webp' ? 'webp' : 'jpg'

  const filename = `${crypto.randomUUID()}.${ext}`

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })

  const filepath = path.join(uploadDir, filename)
  await writeFile(filepath, bytes)

  // URL, который можно сохранить в БД
  return NextResponse.json({ url: `/uploads/${filename}` }, { status: 201 })
}
