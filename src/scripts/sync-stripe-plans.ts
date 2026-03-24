import 'dotenv/config'
import { stripe } from '@/lib/stripe'
import { db } from '@/lib/db'

async function syncPlansWithStripe() {
  console.log('🔄 Syncing plans with Stripe...\n')

  // Get all plans from database
  const plans = await db.plan.findMany({
    where: { isActive: true },
  })

  console.log(`Found ${plans.length} active plans\n`)

  for (const plan of plans) {
    try {
      console.log(`Processing plan: ${plan.name}`)

      // Check if plan already has a Stripe Price ID
      if (plan.stripePriceId) {
        console.log(`✅ Plan "${plan.name}" already has Stripe Price ID: ${plan.stripePriceId}`)
        continue
      }

      // Find or create Stripe Product
      const products = await stripe.products.search({
        query: `metadata['plan_id']:'${plan.id}'`,
      })

      let product = products.data[0]

      if (!product) {
        // Create new Stripe Product
        product = await stripe.products.create({
          name: `${plan.name} Plan`,
          description: `${plan.name} subscription plan - $${plan.price}/${plan.duration}`,
          metadata: {
            plan_id: plan.id,
          },
        })
        console.log(`  ✅ Created Stripe Product: ${product.id}`)
      } else {
        console.log(`  ✅ Found existing Stripe Product: ${product.id}`)
      }

      // Create Stripe Price
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: Math.round(plan.price * 100), // Convert to cents
        currency: 'usd',
        recurring: {
          interval: plan.duration === 'yearly' ? 'year' : 'month',
        },
        metadata: {
          plan_id: plan.id,
        },
      })

      console.log(`  ✅ Created Stripe Price: ${price.id}`)

      // Update plan in database
      await db.plan.update({
        where: { id: plan.id },
        data: {
          stripePriceId: price.id,
        },
      })

      console.log(`  ✅ Updated plan with Stripe Price ID\n`)
    } catch (error: any) {
      console.error(`❌ Error processing plan "${plan.name}":`, error.message)
    }
  }

  console.log('✅ Plans sync completed!')
  console.log('\nNext steps:')
  console.log('1. Set up your webhook endpoint in Stripe Dashboard')
  console.log('2. Use the webhook URL: https://your-domain.com/api/stripe/webhook')
  console.log('3. Select events: checkout.session.completed, customer.subscription.*, invoice.payment.*')
}

// Run the sync
syncPlansWithStripe()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
