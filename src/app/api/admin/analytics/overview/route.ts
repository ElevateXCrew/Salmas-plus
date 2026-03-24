import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      activeUsers,
      totalVideos,
      totalImages,
      totalViewsAgg,
      allActiveSubs,
      monthlyActiveSubs,
      subsByStatus,
      totalSiteVisits,
      uniqueSiteVisitors,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.gallery.count({ where: { contentType: 'video', isActive: true } }),
      db.gallery.count({ where: { contentType: 'image', isActive: true } }),
      db.gallery.aggregate({ _sum: { views: true, likes: true } }),
      db.subscription.findMany({
        where: { status: { in: ['approved', 'active'] } },
        include: { plan: { select: { price: true } } }
      }),
      db.subscription.findMany({
        where: { status: { in: ['approved', 'active'] }, approvedAt: { gte: startOfMonth } },
        include: { plan: { select: { price: true } } }
      }),
      Promise.all(
        ['pending', 'approved', 'active', 'cancelled', 'expired', 'rejected'].map(s =>
          db.subscription.count({ where: { status: s } }).then(count => ({ status: s, count }))
        )
      ),
      db.$queryRaw`SELECT COUNT(*) as cnt FROM SiteVisit`.then((r: any) => Number(r[0]?.cnt || 0)),
      db.$queryRaw`SELECT COUNT(DISTINCT visitorId) as cnt FROM SiteVisit`.then((r: any) => Number(r[0]?.cnt || 0)),
    ])

    // last 6 months user signups - sequential to avoid SQLite lock
    const last6Months = await Promise.all(
      Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 1)
        return db.user.count({ where: { createdAt: { gte: d, lt: end } } }).then(count => ({
          month: d.toLocaleString('default', { month: 'short' }),
          users: count
        }))
      })
    )

    // content by category - Content table only, all 20 premium categories
    const premiumCategoryIds = [
      'solo','roleplay','bathroom','bedroom','lingerie','outdoor','intimate',
      'dance','cosplay','bts','shower','mirror','fitness','pool','nightout',
      'morning','cooking','office','travel','special'
    ]

    const contentItems = await db.gallery.findMany({
      where: { isActive: true, isPremium: true },
      select: { category: true, views: true, likes: true }
    })

    const categoryMap: Record<string, { count: number; views: number; likes: number }> = {}
    for (const id of premiumCategoryIds) categoryMap[id] = { count: 0, views: 0, likes: 0 }
    for (const item of contentItems) {
      const cat = item.category || ''
      if (cat in categoryMap) {
        categoryMap[cat].count++
        categoryMap[cat].views += (item as any).views || 0
        categoryMap[cat].likes += (item as any).likes || 0
      }
    }
    const contentByCategory = premiumCategoryIds.map(id => ({ category: id, ...categoryMap[id] }))

    const totalRevenue = allActiveSubs.reduce((sum, s) => sum + (s.plan?.price || 0), 0)
    const monthlyRevenue = monthlyActiveSubs.reduce((sum, s) => sum + (s.plan?.price || 0), 0)
    const premiumSubscribers = allActiveSubs.length
    const freeUsers = Math.max(0, totalUsers - premiumSubscribers)

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUsers,
          activeUsers,
          premiumSubscribers,
          freeUsers,
          totalRevenue,
          monthlyRevenue,
          totalVideos,
          totalImages,
          totalViews: totalViewsAgg._sum.views || 0,
          totalLikes: totalViewsAgg._sum.likes || 0,
          totalSiteVisits,
          uniqueSiteVisitors,
        },
        userGrowth: last6Months,
        subsByStatus,
        contentByCategory,
      }
    })
  } catch (error: any) {
    console.error('Analytics overview error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
