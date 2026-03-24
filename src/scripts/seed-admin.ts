import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function seedAdmin() {
  try {
    console.log('Seeding admin user...')

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@brandname.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'
    const adminName = 'Admin User'

    // Check if admin already exists
    const existingAdmin = await db.admin.findUnique({
      where: { email: adminEmail }
    })

    if (existingAdmin) {
      console.log('Admin user already exists')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 12)

    // Create admin
    const admin = await db.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: adminName
      }
    })

    console.log('✓ Admin user created successfully')
    console.log('Email:', adminEmail)
    console.log('Password:', adminPassword)
    console.log('Please change the password after first login!')
  } catch (error) {
    console.error('Error seeding admin:', error)
  } finally {
    await db.$disconnect()
  }
}

seedAdmin()
