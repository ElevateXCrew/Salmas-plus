import { db } from '@/lib/db'

async function main() {
  console.log('🌱 Seeding sample subscriptions...')

  // Get all users and plans
  const users = await db.user.findMany()
  const plans = await db.plan.findMany()

  if (users.length === 0) {
    console.log('❌ No users found. Run seed-sample-users.ts first!')
    return
  }

  if (plans.length === 0) {
    console.log('❌ No plans found. Run seed-plans.ts first!')
    return
  }

  console.log(`Found ${users.length} users and ${plans.length} plans`)

  // Create sample subscriptions
  const subscriptions = []

  // User 1 - Premium subscription (approved)
  subscriptions.push({
    userId: users[0].id,
    planId: plans[1]?.id || plans[0].id, // Premium plan
    status: 'approved',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    approvedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    revenue: 24.99,
  })

  // User 2 - Basic subscription (approved)
  subscriptions.push({
    userId: users[1].id,
    planId: plans[0]?.id || plans[0].id, // Basic plan
    status: 'approved',
    startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
    approvedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    revenue: 9.99,
  })

  // User 3 - VIP subscription (approved)
  subscriptions.push({
    userId: users[2].id,
    planId: plans[2]?.id || plans[0].id, // VIP plan
    status: 'approved',
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    approvedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    revenue: 49.99,
  })

  // User 4 - Pending subscription
  subscriptions.push({
    userId: users[3].id,
    planId: plans[1]?.id || plans[0].id, // Premium plan
    status: 'pending',
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    revenue: 0,
  })

  // User 5 - Rejected subscription
  subscriptions.push({
    userId: users[4].id,
    planId: plans[0]?.id || plans[0].id, // Basic plan
    status: 'rejected',
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    rejectedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    revenue: 0,
  })

  // User 7 - Expired subscription
  subscriptions.push({
    userId: users[6].id,
    planId: plans[0]?.id || plans[0].id, // Basic plan
    status: 'expired',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
    endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago (expired)
    revenue: 9.99,
  })

  for (const subData of subscriptions) {
    try {
      const subscription = await db.subscription.create({
        data: subData,
      })
      console.log(`✅ Created subscription for user ${subData.userId}`)
    } catch (error) {
      console.error(`❌ Error creating subscription:`, error)
    }
  }

  console.log('\n📊 Subscriptions Summary:')
  console.log(`Total subscriptions: ${subscriptions.length}`)
  console.log(`Approved: ${subscriptions.filter(s => s.status === 'approved').length}`)
  console.log(`Pending: ${subscriptions.filter(s => s.status === 'pending').length}`)
  console.log(`Rejected: ${subscriptions.filter(s => s.status === 'rejected').length}`)
  console.log(`Expired: ${subscriptions.filter(s => s.status === 'expired').length}`)

  console.log('\n💰 Revenue Summary:')
  const totalRevenue = subscriptions
    .filter(s => s.status === 'approved' || s.status === 'expired')
    .reduce((sum, s) => sum + (s.revenue || 0), 0)
  console.log(`Total Revenue: $${totalRevenue.toFixed(2)}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
