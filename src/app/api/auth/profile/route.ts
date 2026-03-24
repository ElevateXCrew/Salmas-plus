import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { db } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export async function PUT(request: NextRequest) {
  try {
    const { name, email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Get token from cookies
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string }
    
    // Check if email is already taken by another user
    if (email) {
      const existingUser = await db.user.findFirst({
        where: {
          email: email,
          id: { not: decoded.userId }
        }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email is already taken' },
          { status: 400 }
        )
      }
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: decoded.userId },
      data: {
        name: name || null,
        email: email
      },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
        isActive: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Profile updated successfully',
        user: updatedUser
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}