import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function fixPremiumUserPassword() {
  try {
    console.log('\n🔧 Fixing Premium User Password...\n')
    
    const premiumUser = await prisma.user.findUnique({
      where: { email: 'premium@example.com' },
    })
    
    if (!premiumUser) {
      console.log('❌ Premium user not found!')
      await prisma.$disconnect()
      return
    }
    
    console.log('Current user info:')
    console.log(`  Email: ${premiumUser.email}`)
    console.log(`  Name: ${premiumUser.name}`)
    console.log(`  Password Hash Length: ${premiumUser.password.length}`)
    
    // Generate new password hash
    const newPassword = 'premium123456'
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    console.log('\n📝 Updating password...')
    console.log(`  New Password: ${newPassword}`)
    console.log(`  Hash Length: ${hashedPassword.length}`)
    
    // Update the password
    await prisma.user.update({
      where: { email: 'premium@example.com' },
      data: {
        password: hashedPassword,
      },
    })
    
    console.log('\n✅ Password updated successfully!')
    console.log('\n📧 You can now login with:')
    console.log('   Email: premium@example.com')
    console.log('   Password: premium123456')
    
    await prisma.$disconnect()
  } catch (error: any) {
    console.error('Error:', error.message)
    await prisma.$disconnect()
    process.exit(1)
  }
}

fixPremiumUserPassword()
