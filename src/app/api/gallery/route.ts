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

async function getUserActivePlanId(userId: string): Promise<string | null> {
  try {
    const sub = await db.subscription.findFirst({
      where: {
        userId,
        status: 'approved',
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }]
      },
      select: { planId: true },
      orderBy: { createdAt: 'desc' }
    })
    return sub?.planId ?? null
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
          planAccess: true,
          displayOrder: true,
          views: true,
          likes: true,
          createdAt: true
        }
      }),
      db.gallery.count({ where })
    ])

    const userId = getUserId(request)

    // Filter by planAccess — only show items user's plan has access to
    let userPlanId: string | null = null
    if (userId && premiumParam === 'true') {
      userPlanId = await getUserActivePlanId(userId)
    }

    // Get plan names to check if user is VIP
    let userPlanName: string | null = null
    if (userPlanId) {
      const plan = await db.plan.findUnique({ where: { id: userPlanId }, select: { name: true } })
      userPlanName = plan?.name?.toLowerCase() ?? null
    }
    const isVip = userPlanName?.includes('vip') ?? false

    const accessibleItems = items.filter((item: any) => {
      if (!item.planAccess) return true
      try {
        const allowedPlans: string[] = JSON.parse(item.planAccess)
        if (allowedPlans.length === 0) return true
        if (isVip) return true // VIP users see everything
        return userPlanId ? allowedPlans.includes(userPlanId) : false
      } catch {
        return true
      }
    })

    let likedSet = new Set<string>()
    if (userId && accessibleItems.length > 0) {
      const ids = accessibleItems.map((i: any) => i.id)
      const likedRows = await (db as any).galleryLike.findMany({
        where: { galleryId: { in: ids }, userId },
        select: { galleryId: true }
      })
      likedSet = new Set(likedRows.map((r: any) => r.galleryId))
    }

    const data = accessibleItems.map(item => {
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
