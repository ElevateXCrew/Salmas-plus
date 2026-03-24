import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

/**
 * GET /api/admin/activity-logs - Get activity logs
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const searchParams = request.nextUrl.searchParams
    const adminId = searchParams.get('adminId')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Build where clause
    const whereClause: any = {}
    if (adminId) whereClause.adminId = adminId
    if (action) whereClause.action = action
    if (entityType) whereClause.entityType = entityType

    const logs = await db.activityLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({
      success: true,
      data: logs
    })
  } catch (error: any) {
    console.error('Get activity logs error:', error)

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
      { error: 'Failed to fetch activity logs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/activity-logs - Create new activity log
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const body = await request.json()
    const { action, entityType, entityId, description, metadata, ipAddress } = body

    // Get admin from auth
    const admin = await verifyAdminAuth(request)

    const log = await db.activityLog.create({
      data: {
        adminId: admin.adminId,
        action,
        entityType,
        entityId,
        description,
        metadata: metadata ? JSON.stringify(metadata) : null,
        ipAddress
      }
    })

    return NextResponse.json({
      success: true,
      data: log
    })
  } catch (error: any) {
    console.error('Create activity log error:', error)

    return NextResponse.json(
      { error: 'Failed to create activity log' },
      { status: 500 }
    )
  }
}
