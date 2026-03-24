import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function main() {
  console.log('🌱 Seeding sample users...')

  // Hash password
  const hashedPassword = await bcrypt.hash('user123', 12)

  // Create sample users
  const users = [
    {
      email: 'user1@example.com',
      name: 'Alice Johnson',
      password: hashedPassword,
      gender: 'female',
      dateOfBirth: new Date('1995-03-15'),
      location: 'New York, USA',
      isActive: true,
    },
    {
      email: 'user2@example.com',
      name: 'Bob Smith',
      password: hashedPassword,
      gender: 'male',
      dateOfBirth: new Date('1990-07-22'),
      location: 'London, UK',
      isActive: true,
    },
    {
      email: 'user3@example.com',
      name: 'Carol Williams',
      password: hashedPassword,
      gender: 'female',
      dateOfBirth: new Date('1998-11-08'),
      location: 'Toronto, Canada',
      isActive: true,
    },
    {
      email: 'user4@example.com',
      name: 'David Brown',
      password: hashedPassword,
      gender: 'male',
      dateOfBirth: new Date('1992-01-30'),
      location: 'Sydney, Australia',
      isActive: true,
    },
    {
      email: 'user5@example.com',
      name: 'Eva Martinez',
      password: hashedPassword,
      gender: 'female',
      dateOfBirth: new Date('1996-06-18'),
      location: 'Madrid, Spain',
      isActive: true,
    },
    {
      email: 'user6@example.com',
      name: 'Frank Lee',
      password: hashedPassword,
      gender: 'male',
      dateOfBirth: new Date('1994-09-25'),
      location: 'Singapore',
      isActive: false, // Inactive user
    },
    {
      email: 'user7@example.com',
      name: 'Grace Kim',
      password: hashedPassword,
      gender: 'female',
      dateOfBirth: new Date('1997-12-05'),
      location: 'Seoul, South Korea',
      isActive: true,
    },
    {
      email: 'user8@example.com',
      name: 'Henry Chen',
      password: hashedPassword,
      gender: 'male',
      dateOfBirth: new Date('1991-04-12'),
      location: 'Taipei, Taiwan',
      isActive: true,
    },
  ]

  for (const userData of users) {
    try {
      const user = await db.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData,
      })
      console.log(`✅ Created/Updated user: ${user.email}`)
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error)
    }
  }

  console.log('\n📊 Sample Users Summary:')
  console.log(`Total users: ${users.length}`)
  console.log(`Active: ${users.filter(u => u.isActive).length}`)
  console.log(`Inactive: ${users.filter(u => !u.isActive).length}`)
  console.log(`Male: ${users.filter(u => u.gender === 'male').length}`)
  console.log(`Female: ${users.filter(u => u.gender === 'female').length}`)

  console.log('\n🔐 Test Credentials:')
  console.log('Email: user1@example.com, Password: user123')
  console.log('Email: user2@example.com, Password: user123')
  console.log('(All users have the same password: user123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
