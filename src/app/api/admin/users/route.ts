import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'
import { z } from 'zod'

const updateUserStatusSchema = z.object({
  isActive: z.boolean()
})

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional()
})

// Validation schema for pagination
const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional()
})

/**
 * GET /api/admin/users - List all users with pagination
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const rawSearch = searchParams.get('search')
    const validation = paginationSchema.safeParse({
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '10',
      search: rawSearch || ''
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      )
    }

    const page = parseInt(validation.data.page || '1')
    const limit = parseInt(validation.data.limit || '10')
    const search = validation.data.search || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } }
      ]
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              subscriptions: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.user.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Get users error:', error)

    if (error.message === 'Not authenticated' || error.message === 'Invalid token' || error.message === 'Token expired') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }

    if (error.message === 'Account has been deactivated') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/users - Update user (name, email, isActive)
 */
export async function PUT(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    const body = await request.json()
    const validation = updateUserSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })

    const existing = await db.user.findUnique({ where: { id: userId } })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (validation.data.email && validation.data.email !== existing.email) {
      const emailTaken = await db.user.findUnique({ where: { email: validation.data.email } })
      if (emailTaken) return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: validation.data,
      select: { id: true, email: true, name: true, isActive: true, updatedAt: true }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: any) {
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

/**
 * PATCH /api/admin/users - Toggle user active status
 */
export async function PATCH(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
    const body = await request.json()
    const validation = updateUserStatusSchema.safeParse(body)
    if (!validation.success) return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 })

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { id: userId } })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const updated = await db.user.update({
      where: { id: userId },
      data: { isActive: validation.data.isActive },
      select: { id: true, email: true, name: true, isActive: true, updatedAt: true }
    })

    return NextResponse.json({
      success: true,
      message: `User ${validation.data.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated
    })
  } catch (error: any) {
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/users - Delete a user
 */
export async function DELETE(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')
    if (!userId) return NextResponse.json({ error: 'User ID is required' }, { status: 400 })

    const existing = await db.user.findUnique({ where: { id: userId } })
    if (!existing) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await db.user.delete({ where: { id: userId } })

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error: any) {
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message))
      return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
