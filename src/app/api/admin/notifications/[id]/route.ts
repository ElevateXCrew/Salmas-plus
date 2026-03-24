import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

/**
 * PATCH /api/admin/notifications/[id] - Mark notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminAuth(request)

    const { id } = params

    const notification = await db.notification.update({
      where: { id },
      data: { isRead: true }
    })

    return NextResponse.json({
      success: true,
      data: notification
    })
  } catch (error: any) {
    console.error('Update notification error:', error)

    return NextResponse.json(
      { error: 'Failed to update notification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/notifications/[id] - Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdminAuth(request)

    const { id } = params

    await db.notification.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Notification deleted'
    })
  } catch (error: any) {
    console.error('Delete notification error:', error)

    return NextResponse.json(
      { error: 'Failed to delete notification' },
      { status: 500 }
    )
  }
}
