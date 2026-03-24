import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

export interface AdminAuthPayload {
  adminId: string
  email: string
  type: string
}

/**
 * Verify admin authentication from JWT token in cookie
 * @param request - NextRequest object
 * @returns Decoded admin payload or throws error
 */
export async function verifyAdminAuth(request: NextRequest): Promise<AdminAuthPayload> {
  // Get token from cookie
  const token = request.cookies.get('admin-auth-token')?.value

  if (!token) {
    throw new Error('Not authenticated')
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as AdminAuthPayload

    if (decoded.type !== 'admin') {
      throw new Error('Invalid token type')
    }

    // Verify admin exists and is active
    const admin = await db.admin.findUnique({
      where: { id: decoded.adminId },
      select: { isActive: true }
    })

    if (!admin) {
      throw new Error('Admin not found')
    }

    if (!admin.isActive) {
      throw new Error('Account has been deactivated')
    }

    return decoded
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token')
    }

    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired')
    }

    throw error
  }
}
