import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedDummyData() {
  try {
    console.log('🌱 Seeding dummy data for admin panel...\n')

    // 1. Create dummy users
    console.log('👥 Creating dummy users...')
    const users = []
    const userEmails = [
      { name: 'Ahmed Khan', email: 'ahmed@example.com' },
      { name: 'Sara Ali', email: 'sara@example.com' },
      { name: 'Hassan Raza', email: 'hassan@example.com' },
      { name: 'Ayesha Malik', email: 'ayesha@example.com' },
      { name: 'Bilal Ahmed', email: 'bilal@example.com' },
      { name: 'Fatima Noor', email: 'fatima@example.com' },
      { name: 'Usman Ali', email: 'usman@example.com' },
      { name: 'Zainab Hassan', email: 'zainab@example.com' },
      { name: 'Ali Raza', email: 'ali@example.com' },
      { name: 'Maryam Khan', email: 'maryam@example.com' },
    ]

    const hashedPassword = await bcrypt.hash('Test123456', 12)

    for (const userData of userEmails) {
      const existingUser = await db.user.findUnique({
        where: { email: userData.email }
      })

      if (!existingUser) {
        const user = await db.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            isActive: Math.random() > 0.2 // 80% active users
          }
        })
        users.push(user)
        console.log(`  ✓ Created user: ${userData.name}`)
      } else {
        users.push(existingUser)
        console.log(`  ⚠ User already exists: ${userData.name}`)
      }
    }

    // 2. Get plans
    console.log('\n📋 Getting subscription plans...')
    const plans = await db.plan.findMany()
    if (plans.length === 0) {
      console.log('  ❌ No plans found. Please run seed-plans.ts first')
      return
    }
    console.log(`  ✓ Found ${plans.length} plans`)

    // 3. Create subscriptions for users
    console.log('\n💳 Creating subscriptions...')
    const statuses = ['pending', 'approved', 'rejected', 'expired']
    let subscriptionCount = 0

    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const plan = plans[Math.floor(Math.random() * plans.length)]
      const status = statuses[Math.floor(Math.random() * statuses.length)]

      const existingSub = await db.subscription.findFirst({
        where: { userId: user.id }
      })

      if (!existingSub) {
        const startDate = status === 'approved' ? new Date() : null
        const endDate = status === 'approved' ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null
        const approvedAt = status === 'approved' ? new Date() : null
        const rejectedAt = status === 'rejected' ? new Date() : null

        await db.subscription.create({
          data: {
            userId: user.id,
            planId: plan.id,
            status,
            startDate,
            endDate,
            approvedAt,
            rejectedAt,
            requestDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random date within last 7 days
          }
        })
        subscriptionCount++
        console.log(`  ✓ Created ${status} subscription for ${user.name} - ${plan.name} plan`)
      }
    }
    console.log(`  ✓ Total subscriptions created: ${subscriptionCount}`)

    // 4. Create gallery items
    console.log('\n🖼️ Creating gallery items...')
    const galleryCategories = ['solo', 'roleplay', 'bathroom', 'bedroom', 'lingerie', 'bikini', 'outdoor', 'cosplay', 'fetish', 'couple']
    const galleryTitles = [
      'Elegant Portrait Session',
      'Sunset Beach Vibes',
      'Studio Glamour Shot',
      'Natural Beauty',
      'Urban Fashion',
      'Vintage Style',
      'Modern Elegance',
      'Artistic Expression',
      'Candid Moments',
      'Professional Shoot',
      'Creative Concept',
      'Lifestyle Photography',
      'Fashion Editorial',
      'Intimate Portrait',
      'Outdoor Adventure',
      'Studio Magic',
      'Golden Hour',
      'Black & White Classic',
      'Colorful Expression',
      'Minimalist Style'
    ]

    let galleryCount = 0
    for (let i = 0; i < 30; i++) {
      const category = galleryCategories[Math.floor(Math.random() * galleryCategories.length)]
      const title = galleryTitles[Math.floor(Math.random() * galleryTitles.length)] + ` ${i + 1}`
      
      const existingGallery = await db.gallery.findFirst({
        where: { title }
      })

      if (!existingGallery) {
        await db.gallery.create({
          data: {
            title,
            description: `Beautiful ${category} photography showcasing artistic vision and creativity`,
            imageUrl: `/images/gallery-${(i % 4) + 1}.png`,
            thumbnailUrl: `/images/gallery-${(i % 4) + 1}.png`,
            category,
            isActive: Math.random() > 0.1, // 90% active
            displayOrder: i + 1
          }
        })
        galleryCount++
        console.log(`  ✓ Created gallery item: ${title} (${category})`)
      }
    }
    console.log(`  ✓ Total gallery items created: ${galleryCount}`)

    // 5. Create contact messages
    console.log('\n📧 Creating contact messages...')
    const subjects = [
      'Question about Premium Plan',
      'Technical Support Needed',
      'Billing Inquiry',
      'Feature Request',
      'Account Access Issue',
      'Subscription Upgrade',
      'Content Request',
      'General Feedback',
      'Partnership Opportunity',
      'Custom Package Inquiry'
    ]

    const messages = [
      'Hi, I would like to know more about the premium subscription features. Can you provide more details?',
      'I am having trouble accessing my account. Could you please help me resolve this issue?',
      'I was charged twice for my subscription. Please check and refund the duplicate payment.',
      'It would be great if you could add more categories to the premium content section.',
      'I forgot my password and the reset email is not arriving. Please assist.',
      'I want to upgrade from Basic to Premium plan. What is the process?',
      'Can I request custom content for my subscription? Please let me know the options.',
      'The website is amazing! Great work on the design and user experience.',
      'I represent a company interested in partnership opportunities. Let\'s discuss.',
      'Do you offer custom packages for corporate clients? Please share pricing details.'
    ]

    let messageCount = 0
    for (let i = 0; i < 15; i++) {
      const user = users[Math.floor(Math.random() * users.length)]
      const subject = subjects[Math.floor(Math.random() * subjects.length)]
      const message = messages[Math.floor(Math.random() * messages.length)]

      await db.contactMessage.create({
        data: {
          userId: Math.random() > 0.3 ? user.id : null, // 70% from logged-in users
          name: user.name || 'Anonymous User',
          email: user.email,
          subject,
          message,
          isRead: Math.random() > 0.4, // 60% read
          createdAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) // Random date within last 14 days
        }
      })
      messageCount++
      console.log(`  ✓ Created message: ${subject}`)
    }
    console.log(`  ✓ Total messages created: ${messageCount}`)

    // Summary
    console.log('\n✅ Dummy data seeding completed!')
    console.log('\n📊 Summary:')
    console.log(`   Users: ${users.length}`)
    console.log(`   Subscriptions: ${subscriptionCount}`)
    console.log(`   Gallery Items: ${galleryCount}`)
    console.log(`   Contact Messages: ${messageCount}`)
    console.log('\n🎯 You can now login to admin panel and see all the data!')
    console.log('   Admin URL: http://localhost:3000/admin')
    console.log('   Email: admin@brandname.com')
    console.log('   Password: admin123456')

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error)
  } finally {
    await db.$disconnect()
  }
}

seedDummyData()