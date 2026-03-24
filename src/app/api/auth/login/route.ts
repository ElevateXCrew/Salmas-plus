import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      const errorMessages = validation.error.issues.map(issue => issue.message)
      return NextResponse.json(
        { error: errorMessages[0] || 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // First, check if it's an admin trying to log in
    let admin = await db.admin.findUnique({
      where: { email }
    })

    if (admin) {
      // This is an admin login attempt
      // Check if admin is active
      if (!admin.isActive) {
        return NextResponse.json(
          { error: 'Account has been deactivated' },
          { status: 403 }
        )
      }

      // Verify password for admin
      const isValidPassword = await bcrypt.compare(password, admin.password)

      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Generate JWT token for admin
      const token = jwt.sign(
        {
          adminId: admin.id,
          email: admin.email,
          type: 'admin'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      // Create response with cookie and redirect to admin panel
      const response = NextResponse.json({
        success: true,
        message: 'Login successful',
        redirect: '/admin',
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email
        }
      })

      // Set HTTP-only cookie for admin
      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/'
      })

      return response
    }

    // If not admin, check if it's a regular user
    let user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account has been deactivated' },
        { status: 403 }
      )
    }

    // Verify password for user
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Generate JWT token for user
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: 'user'
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Create response with cookie and redirect to homepage
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      redirect: '/',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

    // Set HTTP-only cookie for user
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    )
  }
}
