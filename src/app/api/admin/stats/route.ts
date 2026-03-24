import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

/**
 * GET /api/admin/stats - Get dashboard statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Get all stats in parallel
    const [totalUsers, activeSubscriptions, pendingSubscriptions, unreadMessages, recentUsers] = await Promise.all([
      db.user.count(),
      db.subscription.count({
        where: { status: { in: ['approved', 'active'] } }
      }),
      db.subscription.count({
        where: { status: 'pending' }
      }),
      db.contactMessage.count({
        where: { isRead: false }
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true
        }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        activeSubscriptions,
        pendingSubscriptions,
        unreadMessages,
        recentUsers
      }
    })
  } catch (error: any) {
    console.error('Get stats error:', error)

    if (error.message === 'Not authenticated' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error.message === 'Account has been deactivated') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
