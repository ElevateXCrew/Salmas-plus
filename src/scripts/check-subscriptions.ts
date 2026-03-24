import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkSubscriptions() {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
      },
    })

    console.log('\n=== ALL SUBSCRIPTIONS ===\n')
    
    subscriptions.forEach((sub) => {
      const now = new Date()
      const isActive = sub.status === 'active' && sub.endDate > now
      
      console.log(`User: ${sub.user.email} (${sub.user.name})`)
      console.log(`Plan: ${sub.planType}`)
      console.log(`Status: ${sub.status}`)
      console.log(`Start Date: ${sub.startDate}`)
      console.log(`End Date: ${sub.endDate}`)
      console.log(`Is Active: ${isActive ? '✅ YES' : '❌ NO'}`)
      console.log('---\n')
    })

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

checkSubscriptions()
