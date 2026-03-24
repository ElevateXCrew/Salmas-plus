import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'
import { z } from 'zod'

// Validation schema for updating message read status
const updateMessageSchema = z.object({
  isRead: z.boolean()
})

// Validation schema for query parameters
const messagesQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  isRead: z.string().optional(),
  search: z.string().optional()
})

/**
 * GET /api/admin/messages - List all contact messages (with pagination, filter by read/unread)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const validation = messagesQuerySchema.safeParse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      isRead: searchParams.get('isRead'),
      search: searchParams.get('search')
    })

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const page = parseInt(validation.data.page || '1')
    const limit = parseInt(validation.data.limit || '10')
    const isRead = validation.data.isRead
    const search = validation.data.search

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (isRead !== undefined) {
      where.isRead = isRead === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get messages and total count
    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      db.contactMessage.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Get messages error:', error)

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
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/messages - Mark message as read/unread
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse and validate request body
    const body = await request.json()
    const validation = updateMessageSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { isRead } = validation.data
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Check if message exists
    const existingMessage = await db.contactMessage.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Update message read status
    const updatedMessage = await db.contactMessage.update({
      where: { id },
      data: { isRead },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Message marked as ${isRead ? 'read' : 'unread'}`,
      data: updatedMessage
    })
  } catch (error: any) {
    console.error('Update message error:', error)

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
      { error: 'Failed to update message' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/messages - Delete message
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Message ID is required' },
        { status: 400 }
      )
    }

    // Check if message exists
    const existingMessage = await db.contactMessage.findUnique({
      where: { id }
    })

    if (!existingMessage) {
      return NextResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      )
    }

    // Delete message
    await db.contactMessage.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete message error:', error)

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
      { error: 'Failed to delete message' },
      { status: 500 }
    )
  }
}
