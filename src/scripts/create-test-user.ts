import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function createTestUser() {
  try {
    console.log('Creating test user...')

    const email = 'test@example.com'
    const password = 'Test123456'
    const name = 'Test User'

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('Test user already exists')
      console.log('Email:', email)
      console.log('Password:', password)
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    })

    console.log('✓ Test user created successfully')
    console.log('Email:', email)
    console.log('Password:', password)
    console.log('Name:', user.name)
    console.log('You can now login at /login')
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await db.$disconnect()
  }
}

createTestUser()
