import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'daily'

    const now = new Date()
    let startDate: Date
    let periods: { label: string; start: Date; end: Date }[] = []

    switch (timeRange) {
      case 'hourly':
        startDate = new Date(now); startDate.setHours(now.getHours() - 23, 0, 0, 0)
        periods = Array.from({ length: 24 }).map((_, i) => {
          const s = new Date(startDate); s.setHours(startDate.getHours() + i)
          const e = new Date(s); e.setHours(s.getHours() + 1)
          return { label: `${s.getHours()}:00`, start: s, end: e }
        })
        break
      case 'weekly':
        startDate = new Date(now); startDate.setDate(now.getDate() - 83)
        periods = Array.from({ length: 12 }).map((_, i) => {
          const s = new Date(startDate); s.setDate(startDate.getDate() + i * 7)
          const e = new Date(s); e.setDate(s.getDate() + 7)
          return { label: `W${i + 1}`, start: s, end: e }
        })
        break
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1)
        periods = Array.from({ length: 12 }).map((_, i) => {
          const s = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
          const e = new Date(s.getFullYear(), s.getMonth() + 1, 1)
          return { label: s.toLocaleString('default', { month: 'short' }), start: s, end: e }
        })
        break
      case 'yearly':
        startDate = new Date(now.getFullYear() - 4, 0, 1)
        periods = Array.from({ length: 5 }).map((_, i) => {
          const y = now.getFullYear() - (4 - i)
          return { label: String(y), start: new Date(y, 0, 1), end: new Date(y + 1, 0, 1) }
        })
        break
      default: // daily
        startDate = new Date(now); startDate.setDate(now.getDate() - 29)
        periods = Array.from({ length: 30 }).map((_, i) => {
          const s = new Date(startDate); s.setDate(startDate.getDate() + i)
          const e = new Date(s); e.setDate(s.getDate() + 1)
          return { label: `${s.getMonth() + 1}/${s.getDate()}`, start: s, end: e }
        })
    }

    // Fetch all users/subs in range once, then group in JS (avoids N+1 queries)
    const [usersInRange, subsInRange, allUsers, mostViewed, categoryPopularity] = await Promise.all([
      db.user.findMany({ where: { createdAt: { gte: startDate } }, select: { createdAt: true, gender: true, dateOfBirth: true } }),
      db.subscription.findMany({ where: { approvedAt: { gte: startDate }, status: 'approved' }, include: { plan: { select: { price: true } } } }),
      db.user.findMany({ select: { gender: true, dateOfBirth: true } }),
      db.gallery.findMany({
        where: { isPremium: true, isActive: true },
        orderBy: { views: 'desc' },
        take: 10,
        select: { id: true, title: true, contentType: true, views: true, likes: true, category: true }
      }),
      db.gallery.findMany({
        where: { isPremium: true, isActive: true },
        select: { category: true, views: true, likes: true }
      }),
    ])

    // Build time series
    const userGrowth = periods.map(p => ({
      period: p.label,
      users: usersInRange.filter(u => u.createdAt >= p.start && u.createdAt < p.end).length,
      revenue: subsInRange.filter(s => s.approvedAt! >= p.start && s.approvedAt! < p.end).reduce((sum, s) => sum + (s.plan?.price || 0), 0),
      subscriptions: subsInRange.filter(s => s.approvedAt! >= p.start && s.approvedAt! < p.end).length,
    }))

    // Gender distribution (all users)
    const genderMap: Record<string, number> = {}
    for (const u of allUsers) {
      const g = u.gender || 'unknown'
      genderMap[g] = (genderMap[g] || 0) + 1
    }
    const genderDistribution = Object.entries(genderMap).map(([gender, count]) => ({ gender, count }))

    // Age distribution
    const ageGroups: Record<string, number> = { '18-24': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55+': 0, 'unknown': 0 }
    for (const u of allUsers) {
      if (!u.dateOfBirth) { ageGroups['unknown']++; continue }
      const age = Math.floor((now.getTime() - new Date(u.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000))
      if (age < 25) ageGroups['18-24']++
      else if (age < 35) ageGroups['25-34']++
      else if (age < 45) ageGroups['35-44']++
      else if (age < 55) ageGroups['45-54']++
      else ageGroups['55+']++
    }
    const ageDistribution = Object.entries(ageGroups).filter(([, v]) => v > 0).map(([age, count]) => ({ age, count }))

    // Activity heatmap - users per day-of-week x hour (last 30 days)
    const heatmapStart = new Date(now); heatmapStart.setDate(now.getDate() - 29)
    const recentUsers = await db.user.findMany({ where: { createdAt: { gte: heatmapStart } }, select: { createdAt: true } })
    const heatmap: { day: number; hour: number; value: number }[] = []
    const heatmapMap: Record<string, number> = {}
    for (const u of recentUsers) {
      const d = new Date(u.createdAt)
      const key = `${d.getDay()}-${d.getHours()}`
      heatmapMap[key] = (heatmapMap[key] || 0) + 1
    }
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        heatmap.push({ day, hour, value: heatmapMap[`${day}-${hour}`] || 0 })
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        userGrowth,
        genderDistribution,
        ageDistribution,
        mostViewed: mostViewed.map((c: any) => ({
          id: c.id, title: c.title,
          type: c.contentType || 'image',
          views: c.views,
          category: c.category || '—'
        })),
        categoryPopularity: Object.entries(
          categoryPopularity.reduce((acc: any, c: any) => {
            const cat = c.category || 'uncategorized'
            if (!acc[cat]) acc[cat] = { name: cat, totalViews: 0, totalLikes: 0, contentCount: 0 }
            acc[cat].totalViews += c.views || 0
            acc[cat].totalLikes += c.likes || 0
            acc[cat].contentCount += 1
            return acc
          }, {} as Record<string, any>)
        ).map(([, v]) => v).sort((a: any, b: any) => b.totalViews - a.totalViews),
        heatmap,
      }
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
