import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Helper function to get user from token
async function getUserFromToken(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return null
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string
      email: string
      type: string
    }

    if (decoded.type !== 'user') {
      return null
    }

    const user = await db.user.findUnique({
      where: { id: decoded.userId }
    })

    return user
  } catch (error) {
    return null
  }
}

// GET - Get user's subscriptions
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const subscriptions = await db.subscription.findMany({
      where: { userId: user.id },
      include: { plan: true },
      orderBy: { createdAt: 'desc' }
    })

    // Parse features from JSON
    const subscriptionsWithParsedFeatures = subscriptions.map(sub => ({
      ...sub,
      plan: {
        ...sub.plan,
        features: JSON.parse(sub.plan.features)
      }
    }))

    return NextResponse.json({
      success: true,
      subscriptions: subscriptionsWithParsedFeatures
    })
  } catch (error: any) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    )
  }
}

// POST - Create a new subscription request
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request)

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Check if plan exists
    const plan = await db.plan.findUnique({
      where: { id: planId }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if user already has a pending or approved subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: { in: ['pending', 'approved'] }
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active or pending subscription' },
        { status: 400 }
      )
    }

    // Create subscription request
    const subscription = await db.subscription.create({
      data: {
        userId: user.id,
        planId
      },
      include: { plan: true }
    })

    // Parse features from JSON
    const subscriptionWithParsedFeatures = {
      ...subscription,
      plan: {
        ...subscription.plan,
        features: JSON.parse(subscription.plan.features)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription request submitted. Waiting for admin approval.',
      subscription: subscriptionWithParsedFeatures
    })
  } catch (error: any) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription request' },
      { status: 500 }
    )
  }
}
