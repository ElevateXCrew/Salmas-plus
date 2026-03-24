import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'
import { z } from 'zod'

const subscriptionsQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional()
})

const createSubscriptionSchema = z.object({
  userId: z.string().min(1),
  planId: z.string().min(1),
  status: z.enum(['pending', 'approved', 'rejected', 'expired', 'cancelled']).default('approved'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const validation = subscriptionsQuerySchema.safeParse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      status: searchParams.get('status') ?? undefined
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const page = parseInt(validation.data.page || '1')
    const limit = parseInt(validation.data.limit || '10')
    const status = validation.data.status

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) {
      where.status = status
    }

    // Get subscriptions and total count
    const [subscriptions, total] = await Promise.all([
      db.subscription.findMany({
        where,
        skip,
        take: limit,
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
        },
        orderBy: { requestDate: 'desc' }
      }),
      db.subscription.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Get subscriptions error:', error)

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
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
    const body = await request.json()
    const validation = createSubscriptionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })
    }
    const { userId, planId, status, startDate, endDate } = validation.data

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const plan = await db.plan.findUnique({ where: { id: planId } })
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

    const now = new Date()
    const start = startDate ? new Date(startDate) : now
    let end = endDate ? new Date(endDate) : null
    if (!end && status === 'approved') {
      // auto calc endDate from plan duration
      end = new Date(start)
      if (plan.duration === 'yearly') end.setFullYear(end.getFullYear() + 1)
      else end.setMonth(end.getMonth() + 1)
    }

    const subscription = await db.subscription.create({
      data: {
        userId,
        planId,
        status,
        startDate: status === 'approved' ? start : null,
        endDate: end,
        requestDate: now,
        approvedAt: status === 'approved' ? now : null,
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        plan: { select: { id: true, name: true, price: true, currency: true, duration: true } }
      }
    })

    return NextResponse.json({ success: true, data: subscription }, { status: 201 })
  } catch (error: any) {
    console.error('Create subscription error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const existing = await db.subscription.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })

    await db.subscription.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete subscription error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: 'Failed to delete subscription' }, { status: 500 })
  }
}
