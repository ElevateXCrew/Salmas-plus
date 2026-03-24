import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const timeRange = request.nextUrl.searchParams.get('timeRange') || 'monthly'
    const now = new Date()
    const startDate = new Date()

    switch (timeRange) {
      case 'daily':   startDate.setDate(now.getDate() - 30); break
      case 'weekly':  startDate.setDate(now.getDate() - 84); break
      case 'monthly': startDate.setMonth(now.getMonth() - 12); break
      case 'yearly':  startDate.setFullYear(now.getFullYear() - 5); break
    }

    // All active subscriptions with plan
    const [activeSubs, allSubs, recentSubs, cancelledSubs] = await Promise.all([
      db.subscription.findMany({
        where: { status: { in: ['approved', 'active'] } },
        include: { plan: true, user: { select: { email: true, name: true } } }
      }),
      db.subscription.findMany({
        where: { status: { in: ['approved', 'active'] }, approvedAt: { gte: startDate } },
        include: { plan: true }
      }),
      db.subscription.findMany({
        where: { status: { in: ['approved', 'active', 'cancelled', 'expired'] } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { plan: true, user: { select: { email: true, name: true } } }
      }),
      db.subscription.findMany({
        where: { status: { in: ['cancelled', 'expired', 'rejected'] }, approvedAt: { gte: startDate } },
        include: { plan: true }
      })
    ])

    // Total revenue
    const totalRevenue = activeSubs.reduce((sum, s) => sum + (s.revenue > 0 ? s.revenue : s.plan.price), 0)

    // MRR - active non-expired
    const mrr = activeSubs
      .filter(s => !s.endDate || s.endDate >= now)
      .reduce((sum, s) => sum + s.plan.price, 0)

    // Revenue by plan
    const planMap: Record<string, { planName: string; price: number; subscribers: number; revenue: number }> = {}
    for (const s of activeSubs) {
      const key = s.plan.id
      if (!planMap[key]) planMap[key] = { planName: s.plan.name, price: s.plan.price, subscribers: 0, revenue: 0 }
      planMap[key].subscribers += 1
      planMap[key].revenue += s.revenue > 0 ? s.revenue : s.plan.price
    }
    const revenueByPlan = Object.values(planMap)
      .sort((a, b) => b.revenue - a.revenue)
      .map(p => ({ ...p, revenue: p.revenue.toFixed(2), price: p.price.toFixed(2) }))

    // Revenue trend - group by period in JS
    const getPeriodKey = (date: Date) => {
      switch (timeRange) {
        case 'daily':   return `${date.getMonth() + 1}/${date.getDate()}`
        case 'weekly':  { const w = Math.ceil(date.getDate() / 7); return `${date.toLocaleString('default', { month: 'short' })} W${w}` }
        case 'monthly': return date.toLocaleString('default', { month: 'short', year: 'numeric' })
        case 'yearly':  return String(date.getFullYear())
        default:        return `${date.getMonth() + 1}/${date.getDate()}`
      }
    }

    const trendMap: Record<string, number> = {}
    for (const s of allSubs) {
      if (!s.approvedAt) continue
      const key = getPeriodKey(new Date(s.approvedAt))
      trendMap[key] = (trendMap[key] || 0) + (s.revenue > 0 ? s.revenue : s.plan.price)
    }
    const revenueTrend = Object.entries(trendMap)
      .map(([period, revenue]) => ({ period, revenue: revenue.toFixed(2) }))

    // Recent transactions
    const recentTransactions = recentSubs.map(s => ({
      id: s.id,
      revenue: (s.revenue > 0 ? s.revenue : s.plan.price).toFixed(2),
      status: s.status,
      date: (s.approvedAt || s.createdAt).toISOString(),
      userEmail: s.user.email,
      userName: s.user.name || '',
      planName: s.plan.name
    }))

    // Cancelled/refunds
    const refundAmount = cancelledSubs.reduce((sum, s) => sum + s.plan.price, 0)
    const refunds = { count: cancelledSubs.length, totalAmount: refundAmount.toFixed(2) }

    const totalSubscribers = revenueByPlan.reduce((sum, p) => sum + p.subscribers, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalRevenue: totalRevenue.toFixed(2),
        mrr: mrr.toFixed(2),
        revenueByPlan,
        revenueTrend,
        recentTransactions,
        refunds,
        metrics: {
          totalSubscribers,
          averageRevenuePerUser: totalSubscribers > 0 ? totalRevenue / totalSubscribers : 0
        }
      }
    })
  } catch (error: any) {
    console.error('Revenue overview error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to fetch revenue data' }, { status: 500 })
  }
}