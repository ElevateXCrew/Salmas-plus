import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

/**
 * GET /api/admin/content/[id] - Get single content item
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params

    const content = await db.content.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })

    if (!content) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error: any) {
    console.error('Get content error:', error)

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
      { error: 'Failed to fetch content' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/content/[id] - Update content
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params
    const body = await request.json()

    const allowedFields = [
      'title',
      'description',
      'mediaUrl',
      'thumbnailUrl',
      'type',
      'categoryId',
      'isPremium',
      'status',
      'displayOrder'
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Validate type if provided
    if (updateData.type && !['video', 'image'].includes(updateData.type)) {
      return NextResponse.json(
        { error: 'Type must be either "video" or "image"' },
        { status: 400 }
      )
    }

    // Validate status if provided
    if (updateData.status && !['active', 'hidden', 'frozen'].includes(updateData.status)) {
      return NextResponse.json(
        { error: 'Status must be active, hidden, or frozen' },
        { status: 400 }
      )
    }

    const content = await db.content.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: content
    })
  } catch (error: any) {
    console.error('Update content error:', error)

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
      { error: 'Failed to update content' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/content/[id] - Delete content
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params

    await db.content.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete content error:', error)

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
      { error: 'Failed to delete content' },
      { status: 500 }
    )
  }
}
