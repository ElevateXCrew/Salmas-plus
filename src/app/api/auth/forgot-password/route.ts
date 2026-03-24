import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'
import { sendPasswordResetEmail } from '@/lib/email'
import { hashResetToken } from '@/lib/token'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    })

    // Always return success to prevent email enumeration
    // In a real app, you would send an actual email here
    if (user) {
      // Generate reset token (valid for 1 hour)
      const resetToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
      )

      // Hash the token before storing in database
      const hashedToken = hashResetToken(resetToken)

      // Save reset token to database with expiration (1 hour)
      await db.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
        }
      })

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.name || undefined)
        console.log(`✅ Password reset email sent to: ${email}`)
      } catch (emailError: any) {
        console.error('❌ Failed to send reset email:', emailError?.message || emailError)
        console.log('⚠️ Continuing without email (development mode)')
        // Don't fail the request if email fails - just log it
        // In production, you might want to handle this differently
      }
      
      console.log(`Password reset requested for: ${email}`)
      console.log(`Reset token (for development): ${resetToken}`)
    }

    return NextResponse.json(
      { message: 'If an account with that email exists, we have sent password reset instructions.' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}