// import { NextResponse } from 'next/server'
// import { prisma } from '@/src/lib/prisma'
// import { requireAdmin } from '@/src/lib/auth'

// export async function GET() {
//   await requireAdmin()
//   const items = await prisma.portfolioItem.findMany({ orderBy: { createdAt: 'desc' } })
//   return NextResponse.json({ items })
// }

// export async function POST(req: Request) {
//   await requireAdmin()
//   const { title, projectUrl, description, coverImageUrl, isPublished } = await req.json()

//   if (!title || !projectUrl) {
//     return NextResponse.json({ error: 'title и projectUrl обязательны' }, { status: 400 })
//   }

//   // лёгкая валидация url
//   try {
//     new URL(projectUrl)
//   } catch {
//     return NextResponse.json({ error: 'Некорректная ссылка (projectUrl)' }, { status: 400 })
//   }

//   const item = await prisma.portfolioItem.create({
//     data: {
//       title: String(title).trim(),
//       projectUrl: String(projectUrl).trim(),
//       description: description ? String(description) : null,
//       coverImageUrl: coverImageUrl ? String(coverImageUrl) : null,
//       isPublished: Boolean(isPublished),
//     },
//   })

//   return NextResponse.json({ item }, { status: 201 })
// }
import { NextResponse } from 'next/server'
import { prisma } from '@/src/lib/prisma'

export async function GET() {
  const items = await prisma.portfolioItem.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}
