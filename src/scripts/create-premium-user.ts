import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createTestUserWithSubscription() {
  try {
    console.log('Creating test user with subscription...')

    const email = 'premium@example.com'
    const password = 'Premium123456'
    const name = 'Premium User'

    // Check if user already exists
    let user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      // Create user
      user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      })
      console.log('✓ Test user created')
    } else {
      console.log('✓ Test user already exists')
    }

    // Get Premium plan
    const premiumPlan = await db.plan.findFirst({
      where: { name: 'Premium' }
    })

    if (!premiumPlan) {
      console.log('❌ Premium plan not found. Please run seed-plans.ts first')
      return
    }

    // Check if user already has an approved subscription
    const existingSubscription = await db.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'approved'
      }
    })

    if (!existingSubscription) {
      // Create approved subscription
      const startDate = new Date()
      const endDate = new Date()
      endDate.setMonth(endDate.getMonth() + 1) // 1 month from now

      await db.subscription.create({
        data: {
          userId: user.id,
          planId: premiumPlan.id,
          status: 'approved',
          startDate,
          endDate,
          approvedAt: new Date()
        }
      })
      console.log('✓ Premium subscription created and approved')
    } else {
      console.log('✓ User already has approved subscription')
    }

    console.log('\\n=== Test User Credentials ===')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Plan: Premium (Approved)')
    console.log('\\nYou can now login at /login and access /premium')
  } catch (error) {
    console.error('Error creating test user with subscription:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestUserWithSubscription()