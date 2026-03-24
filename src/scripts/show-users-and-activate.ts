import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function showUsersAndActivatePremium() {
  try {
    console.log('\n=== ALL USERS WITH CREDENTIALS ===\n')
    
    const users = await prisma.user.findMany({
      include: {
        subscriptions: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })
    
    console.log('📋 LOGIN CREDENTIALS:\n')
    console.log('=' .repeat(60))
    
    users.forEach((user, index) => {
      const hasActiveSub = user.subscriptions.some(
        (s) => s.status === 'active' && s.endDate > new Date()
      )
      
      console.log(`\n${index + 1}. ${user.name || 'User'}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Password: [hashed - see below for test passwords]`)
      console.log(`   Premium: ${hasActiveSub ? '✅ YES' : '❌ NO'}`)
      
      if (user.subscriptions.length > 0) {
        user.subscriptions.forEach(sub => {
          console.log(`   └─ Subscription: ${sub.planType} (${sub.status})`)
          console.log(`      Ends: ${sub.endDate.toLocaleDateString()}`)
        })
      }
    })
    
    console.log('\n' + '='.repeat(60))
    console.log('\n🔑 DEFAULT TEST PASSWORDS (from previous setup):\n')
    console.log('1. admin@example.com         → admin123456')
    console.log('2. user@example.com          → user123456')
    console.log('3. premium@example.com       → premium123456 ⭐ RECOMMENDED FOR TESTING')
    console.log('4. muhammadsuleman4443@gmail.com → [your password]')
    console.log('5. mmuhammadsuleman4443@gmail.com → [your password]')
    console.log('6. mmmuhammadsuleman4443@gmail.com → [your password]')
    console.log('7. workingtest@example.com   → test123456')
    
    // Activate premium subscription
    console.log('\n' + '='.repeat(60))
    console.log('\n🔄 ACTIVATING PREMIUM USER...\n')
    
    const premiumUser = await prisma.user.findUnique({
      where: { email: 'premium@example.com' },
      include: { subscriptions: true },
    })
    
    if (premiumUser) {
      // Update all subscriptions to active
      for (const sub of premiumUser.subscriptions) {
        await prisma.subscription.update({
          where: { id: sub.id },
          data: {
            status: 'active',
          },
        })
        console.log(`✅ Activated subscription for: ${premiumUser.email}`)
        console.log(`   Plan: ${sub.planType || 'Premium'}`)
        console.log(`   Status: active`)
        console.log(`   Ends: ${sub.endDate.toLocaleDateString()}`)
      }
      
      console.log('\n✨ Premium user is now ACTIVE!')
      console.log('\n📧 Login with:')
      console.log('   Email: premium@example.com')
      console.log('   Password: premium123456')
    } else {
      console.log('❌ Premium user not found!')
    }
    
    await prisma.$disconnect()
  } catch (error: any) {
    console.error('Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

showUsersAndActivatePremium()
