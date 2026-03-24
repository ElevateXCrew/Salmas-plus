import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedTestUser() {
  try {
    console.log('Creating test premium user...')

    const email = 'test@premium.com'
    const password = 'test123456'

    // Delete existing test user if any
    await db.user.deleteMany({ where: { email } })

    // Create user
    const user = await db.user.create({
      data: {
        email,
        password: await bcrypt.hash(password, 12),
        name: 'Test Premium User',
        isActive: true,
      }
    })

    // Get first active plan
    const plan = await db.plan.findFirst({ where: { isActive: true } })

    if (!plan) {
      console.log('❌ No plans found. Run seed-plans.ts first.')
      return
    }

    // Create approved subscription
    await db.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        approvedAt: new Date(),
      }
    })

    console.log('✅ Test premium user created!')
    console.log('Email   :', email)
    console.log('Password:', password)
    console.log('Plan    :', plan.name)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await db.$disconnect()
  }
}

seedTestUser()
