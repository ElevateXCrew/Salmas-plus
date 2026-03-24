import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'
import { z } from 'zod'

// Validation schema for updating subscription
const updateSubscriptionSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending', 'expired', 'cancelled']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  extendDays: z.number().int().positive().optional()
})

/**
 * GET /api/admin/subscriptions/[id] - Get subscription details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(request)
    const { id } = await params

    // Get subscription with related data
    const subscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            duration: true,
            features: true,
            isActive: true
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: subscription
    })
  } catch (error: any) {
    console.error('Get subscription error:', error)

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
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/subscriptions/[id] - Approve or reject subscription
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdminAuth(request)
    const { id } = await params

    // Parse and validate request body
    const body = await request.json()
    const validation = updateSubscriptionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { status, startDate, endDate, extendDays } = validation.data

    if (!status && !extendDays) {
      return NextResponse.json({ error: 'status or extendDays required' }, { status: 400 })
    }

    // Check if subscription exists
    const existingSubscription = await db.subscription.findUnique({
      where: { id },
      include: {
        user: { select: { isActive: true } }
      }
    })

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check if user is active when approving
    if (status === 'approved' && !existingSubscription.user.isActive) {
      return NextResponse.json(
        { error: 'Cannot approve subscription for inactive user' },
        { status: 400 }
      )
    }

    // Build update data
    const updateData: any = {}

    if (extendDays) {
      // Extend endDate by N days
      const base = existingSubscription.endDate ? new Date(existingSubscription.endDate) : new Date()
      base.setDate(base.getDate() + extendDays)
      updateData.endDate = base
      // If expired, reactivate to approved
      if (existingSubscription.status === 'expired' || existingSubscription.status === 'cancelled') {
        updateData.status = 'approved'
        updateData.approvedAt = new Date()
      }
    } else if (status) {
      updateData.status = status
      if (status === 'approved') {
        updateData.approvedAt = new Date()
        updateData.startDate = startDate ? new Date(startDate) : new Date()
        if (endDate) updateData.endDate = new Date(endDate)
      } else if (status === 'rejected') {
        updateData.rejectedAt = new Date()
      }
    }

    // Update subscription
    const updatedSubscription = await db.subscription.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        plan: {
          select: {
            id: true,
            name: true,
            price: true,
            currency: true,
            duration: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Subscription ${status} successfully`,
      data: updatedSubscription
    })
  } catch (error: any) {
    console.error('Update subscription error:', error)

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
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}
