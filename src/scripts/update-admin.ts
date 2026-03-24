import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

async function updateAdmin() {
  const email = 'admin@brandname.com'
  const password = 'admin123456'
  const hashedPassword = await bcrypt.hash(password, 12)

  // Delete all existing admins and recreate
  await db.admin.deleteMany({})
  const admin = await db.admin.create({
    data: { email, password: hashedPassword, name: 'Admin User', isActive: true }
  })

  console.log('✓ Admin updated:', admin.email)
  await db.$disconnect()
}

updateAdmin().catch(console.error)
