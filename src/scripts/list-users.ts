import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      include: {
        subscriptions: true,
      },
    })

    console.log('\n=== USER LIST ===\n')
    
    users.forEach((user) => {
      const hasActiveSub = user.subscriptions.some(
        (s) => s.status === 'active' && s.endDate > new Date()
      )
      
      console.log(`Email: ${user.email}`)
      console.log(`Name: ${user.name || 'N/A'}`)
      console.log(`Has Premium: ${hasActiveSub ? '✅ YES' : '❌ NO'}`)
      
      if (hasActiveSub) {
        const sub = user.subscriptions.find(
          (s) => s.status === 'active'
        )
        if (sub) {
          console.log(`Subscription End: ${sub.endDate}`)
          console.log(`Plan: ${sub.planType}`)
        }
      }
      console.log('---')
    })

    await prisma.$disconnect()
  } catch (error: any) {
    console.error('Error:', error.message)
  }
}

listUsers()
