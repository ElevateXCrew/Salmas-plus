import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

/**
 * POST /api/admin/content/bulk - Bulk operations on content
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const body = await request.json()
    const { action, ids, data } = body

    if (!action || !ids || !Array.isArray(ids)) {
      return NextResponse.json(
        { error: 'Action and ids array are required' },
        { status: 400 }
      )
    }

    let result

    switch (action) {
      case 'delete':
        result = await db.content.deleteMany({
          where: {
            id: { in: ids }
          }
        })
        break

      case 'hide':
        result = await db.content.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            status: 'hidden'
          }
        })
        break

      case 'show':
        result = await db.content.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            status: 'active'
          }
        })
        break

      case 'freeze':
        result = await db.content.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            status: 'frozen'
          }
        })
        break

      case 'publish':
        result = await db.content.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            status: 'active'
          }
        })
        break

      case 'mark-premium':
        if (!data || typeof data.isPremium !== 'boolean') {
          return NextResponse.json(
            { error: 'isPremium boolean is required' },
            { status: 400 }
          )
        }
        result = await db.content.updateMany({
          where: {
            id: { in: ids }
          },
          data: {
            isPremium: data.isPremium
          }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action. Allowed: delete, hide, show, freeze, publish, mark-premium' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      count: result.count
    })
  } catch (error: any) {
    console.error('Bulk content operation error:', error)

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
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    )
  }
}
