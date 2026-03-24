import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stripe, getStripeCustomerByEmail, createStripeCustomer, createCheckoutSession } from '@/lib/stripe'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    // Get auth token from cookie
    const authToken = request.cookies.get('auth-token')?.value

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    // Verify token and get user ID
    let decoded: any
    try {
      decoded = jwt.verify(authToken, JWT_SECRET) as any
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const { userId, email } = decoded

    // Find user in database
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { planId } = body

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Get plan details
    const plan = await db.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'This plan is not configured for Stripe payments. Please contact admin.' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
    let customerId = user.stripeCustomerId

    if (!customerId) {
      // Try to find existing Stripe customer by email
      let stripeCustomer = await getStripeCustomerByEmail(user.email)

      if (!stripeCustomer) {
        // Create new Stripe customer
        stripeCustomer = await createStripeCustomer(user.email, user.name || undefined)
      }

      // Update user with Stripe customer ID
      await db.user.update({
        where: { id: user.id },
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
      })

      customerId = stripeCustomer.id
    }

    // Create checkout session
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    const session = await createCheckoutSession({
      customerId,
      priceId: plan.stripePriceId,
      successUrl: `${appUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${appUrl}/pricing?canceled=true`,
    })

    // Create pending subscription record
    await db.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'pending',
        stripeSessionId: session.id,
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
