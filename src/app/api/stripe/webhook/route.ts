import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature') as string

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('❌ Webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 400 }
    )
  }

  if (!signature) {
    console.error('❌ Missing stripe-signature header')
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`)
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${err.message}` },
      { status: 400 }
    )
  }

  console.log(`✅ Webhook received: ${event.type}`)

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        
        console.log('💳 Checkout session completed:', session.id)
        
        if (session.mode === 'subscription') {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )

          // Find user by Stripe customer ID
          const user = await db.user.findUnique({
            where: {
              stripeCustomerId: session.customer as string,
            },
          })

          if (user) {
            // Update user with subscription info
            const periodEnd = subscription.current_period_end 
              ? new Date(subscription.current_period_end * 1000)
              : null;

            await db.user.update({
              where: { id: user.id },
              data: {
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: periodEnd,
              },
            })

            // Find or create subscription record
            const existingSubscription = await db.subscription.findFirst({
              where: {
                stripeSessionId: session.id,
              },
            })

            if (!existingSubscription) {
              // Find plan by price ID
              const plan = await db.plan.findFirst({
                where: {
                  stripePriceId: subscription.items.data[0].price.id,
                },
              })

              if (plan) {
                console.log('✅ Creating subscription for user:', user.id, 'Plan:', plan.name)
                const endDate = (subscription as any).current_period_end 
                  ? new Date((subscription as any).current_period_end * 1000)
                  : null;

                await db.subscription.create({
                  data: {
                    userId: user.id,
                    planId: plan.id,
                    status: 'approved',
                    startDate: new Date(),
                    endDate: endDate,
                    approvedAt: new Date(),
                    stripeSessionId: session.id,
                  },
                })
                console.log('✅ Subscription created successfully!')
              } else {
                console.error('❌ Plan not found for price ID:', subscription.items.data[0].price.id)
              }
            }
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('🔄 Subscription updated:', subscription.id)

        // Find user by subscription ID
        const user = await db.user.findFirst({
          where: {
            stripeSubscriptionId: subscription.id,
          },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(
                subscription.current_period_end * 1000
              ),
            },
          })

          // Update subscription status
          const dbSubscription = await db.subscription.findFirst({
            where: {
              userId: user.id,
            },
          })

          if (dbSubscription) {
            const status = subscription.status === 'active' ? 'approved' : 
                          subscription.status === 'canceled' ? 'cancelled' : 
                          subscription.status === 'past_due' ? 'rejected' : 'pending'

            await db.subscription.update({
              where: { id: dbSubscription.id },
              data: {
                status,
                endDate: subscription.ended_at ? new Date(subscription.ended_at * 1000) : null,
              },
            })

            console.log(`✅ Subscription status updated to ${status} for user ${user.id}`)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        console.log('❌ Subscription deleted:', subscription.id)

        // Find user by subscription ID
        const user = await db.user.findFirst({
          where: {
            stripeSubscriptionId: subscription.id,
          },
        })

        if (user) {
          await db.user.update({
            where: { id: user.id },
            data: {
              stripeSubscriptionId: null,
              stripePriceId: null,
              stripeCurrentPeriodEnd: null,
            },
          })

          // Update subscription record
          await db.subscription.updateMany({
            where: {
              userId: user.id,
            },
            data: {
              status: 'cancelled',
              endDate: new Date(),
            },
          })

          console.log(`✅ Subscription cancelled for user ${user.id}`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('💰 Payment succeeded:', invoice.id)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        console.log('❌ Payment failed:', invoice.id)
        
        // Find user and update subscription status
        if (invoice.customer) {
          const user = await db.user.findFirst({
            where: {
              stripeCustomerId: invoice.customer as string,
            },
          })

          if (user) {
            await db.subscription.updateMany({
              where: {
                userId: user.id,
                status: 'approved',
              },
              data: {
                status: 'rejected',
              },
            })
          }
        }
        break
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('❌ Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
