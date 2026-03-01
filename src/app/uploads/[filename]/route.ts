import { readFile, stat } from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

function sanitizeFilename(raw: string): string | null {
  const name = decodeURIComponent(raw)

  if (name !== path.basename(name)) return null
  if (!/^[a-zA-Z0-9._-]+$/.test(name)) return null

  return name
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params
  const safeName = sanitizeFilename(filename)

  if (!safeName) {
    return new Response('Not found', { status: 404 })
  }

  const filePath = path.join(UPLOAD_DIR, safeName)
  const ext = path.extname(safeName).toLowerCase()
  const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream'

  try {
    const [file, fileStat] = await Promise.all([readFile(filePath), stat(filePath)])

    return new Response(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new Response('Not found', { status: 404 })
  }
}
