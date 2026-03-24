import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    // Real total views & likes from all gallery items
    const totals = await db.gallery.aggregate({
      _sum: { views: true, likes: true }
    })

    // Real views & likes per category
    const items = await db.gallery.findMany({
      where: { isActive: true, isPremium: true },
      select: { category: true, views: true, likes: true, title: true, id: true }
    })

    const premiumCategoryIds = [
      'solo','roleplay','bathroom','bedroom','lingerie','outdoor','intimate',
      'dance','cosplay','bts','shower','mirror','fitness','pool','nightout',
      'morning','cooking','office','travel','special'
    ]

    const catMap: Record<string, { views: number; likes: number; count: number }> = {}
    for (const id of premiumCategoryIds) catMap[id] = { views: 0, likes: 0, count: 0 }

    for (const item of items) {
      const cat = item.category || ''
      if (cat in catMap) {
        catMap[cat].views += item.views || 0
        catMap[cat].likes += item.likes || 0
        catMap[cat].count++
      }
    }

    const byCategory = premiumCategoryIds.map(id => ({
      category: id,
      views: catMap[id].views,
      likes: catMap[id].likes,
      count: catMap[id].count,
    }))

    // Top 10 most viewed individual items
    const topViewed = await db.gallery.findMany({
      where: { isActive: true, isPremium: true },
      orderBy: { views: 'desc' },
      take: 10,
      select: { id: true, title: true, category: true, contentType: true, views: true, likes: true }
    })

    // Top 10 most liked individual items
    const topLiked = await db.gallery.findMany({
      where: { isActive: true, isPremium: true },
      orderBy: { likes: 'desc' },
      take: 10,
      select: { id: true, title: true, category: true, contentType: true, views: true, likes: true }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalViews: totals._sum.views || 0,
        totalLikes: totals._sum.likes || 0,
        byCategory,
        topViewed,
        topLiked,
      }
    })
  } catch (error: any) {
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
