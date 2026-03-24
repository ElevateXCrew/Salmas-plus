import { db } from '@/lib/db'

async function seedPlans() {
  try {
    console.log('Seeding plans...')

    const plans = [
      {
        name: 'Basic',
        price: 100,
        currency: '£',
        duration: 'monthly',
        features: JSON.stringify([
          'Access to basic gallery',
          'Standard quality images',
          'Email support',
          '1 download per day',
          'Ad-free experience'
        ])
      },
      {
        name: 'Premium',
        price: 150,
        currency: '£',
        duration: 'monthly',
        features: JSON.stringify([
          'Access to premium gallery',
          'High-quality images',
          'Priority support',
          'Unlimited downloads',
          'Exclusive content',
          'Early access to new features'
        ])
      },
      {
        name: 'VIP',
        price: 200,
        currency: '£',
        duration: 'monthly',
        features: JSON.stringify([
          'All Premium features',
          'Ultra HD images',
          '24/7 dedicated support',
          'Custom image requests',
          'Personalized content',
          'Private gallery access',
          'Exclusive events'
        ])
      }
    ]

    for (const plan of plans) {
      await db.plan.upsert({
        where: { name: plan.name },
        update: plan,
        create: plan
      })
      console.log(`✓ Created/Updated plan: ${plan.name}`)
    }

    console.log('Plans seeded successfully!')
  } catch (error) {
    console.error('Error seeding plans:', error)
  } finally {
    await db.$disconnect()
  }
}

seedPlans()
