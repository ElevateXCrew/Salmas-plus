import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

/**
 * GET /api/admin/notifications - Get all notifications for admin
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // Filter by type
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const whereClause: any = {}
    if (type) {
      whereClause.type = type
    }

    // Get notifications
    const notifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Get unread count
    const unreadCount = await db.notification.count({
      where: {
        ...whereClause,
        isRead: false
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        notifications,
        unreadCount
      }
    })
  } catch (error: any) {
    console.error('Get notifications error:', error)

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
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/notifications - Create new notification
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const body = await request.json()
    const { type, title, message, metadata } = body

    const notification = await db.notification.create({
      data: {
        type,
        title,
        message,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error: any) {
    console.error('Create notification error:', error)

    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    )
  }
}
