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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const contentType = searchParams.get('contentType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const where: any = { isActive: true }
    if (category && category !== 'all') where.category = category
    if (contentType) where.contentType = contentType
    const premiumParam = searchParams.get('premium')
    if (premiumParam === 'true') where.isPremium = true
    else where.isPremium = false

    const [items, total] = await Promise.all([
      db.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
        select: {
          id: true,
          title: true,
          description: true,
          imageUrl: true,
          thumbnailUrl: true,
          category: true,
          contentType: true,
          isPremium: true,
          displayOrder: true,
          views: true,
          likes: true,
          createdAt: true
        }
      }),
      db.gallery.count({ where })
    ])

    const userId = getUserId(request)
    let likedSet = new Set<string>()
    if (userId && items.length > 0) {
      const ids = items.map(i => i.id)
      const likedRows = await (db as any).galleryLike.findMany({
        where: { galleryId: { in: ids }, userId },
        select: { galleryId: true }
      })
      likedSet = new Set(likedRows.map((r: any) => r.galleryId))
    }

    const data = items.map(item => {
      const isBase64Video = item.contentType === 'video' && item.imageUrl?.startsWith('data:')

      return {
        ...item,
        // base64 video (old) -> stream URL, disk video -> use as-is
        imageUrl: isBase64Video ? `/api/gallery/stream/${item.id}` : item.imageUrl,
        thumbnailUrl: item.thumbnailUrl || null,
        liked: likedSet.has(item.id)
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Gallery API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
