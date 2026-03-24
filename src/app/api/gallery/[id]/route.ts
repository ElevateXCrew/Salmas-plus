import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function getUserId(request: NextRequest): string | null {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) return null
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    return decoded.userId
  } catch {
    return null
  }
}

// POST /api/gallery/[id] — track view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const item = await db.gallery.findUnique({ where: { id }, select: { id: true, isPremium: true } })
    if (!item || !item.isPremium) return NextResponse.json({ success: false })

    await db.gallery.update({ where: { id }, data: { views: { increment: 1 } } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false })
  }
}

// PATCH /api/gallery/[id] — toggle like
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserId(request)
    if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const item = await db.gallery.findUnique({ where: { id }, select: { id: true, isPremium: true, likes: true } })
    if (!item || !item.isPremium) return NextResponse.json({ success: false })

    const existing = await (db as any).galleryLike.findUnique({
      where: { galleryId_userId: { galleryId: id, userId } }
    })

    if (existing) {
      // Unlike
      await (db as any).galleryLike.delete({ where: { galleryId_userId: { galleryId: id, userId } } })
      await db.gallery.update({ where: { id }, data: { likes: { decrement: 1 } } })
      return NextResponse.json({ success: true, liked: false, likes: Math.max(0, item.likes - 1) })
    } else {
      // Like
      await (db as any).galleryLike.create({ data: { galleryId: id, userId } })
      await db.gallery.update({ where: { id }, data: { likes: { increment: 1 } } })
      return NextResponse.json({ success: true, liked: true, likes: item.likes + 1 })
    }
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ success: false })
  }
}

// GET /api/gallery/[id] — get item with like status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = getUserId(request)

    const item = await db.gallery.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    let liked = false
    if (userId) {
      const existing = await (db as any).galleryLike.findUnique({
        where: { galleryId_userId: { galleryId: id, userId } }
      })
      liked = !!existing
    }

    return NextResponse.json({ success: true, data: { ...item, liked } })
  } catch {
    return NextResponse.json({ success: false })
  }
}
