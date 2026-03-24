import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'
import { z } from 'zod'

// Validation schema for creating/updating gallery item
const galleryItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  imageUrl: z.string().min(1, 'Image URL is required'),
  thumbnailUrl: z.string().optional(),
  category: z.string().optional(),
  contentType: z.string().optional(),
  isPremium: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().optional()
})

// Validation schema for query parameters
const galleryQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  category: z.string().optional(),
  isActive: z.string().optional()
})

/**
 * GET /api/admin/gallery - List all gallery items
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (category) {
      where.category = category
    }
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === 'true'
    }

    // Get gallery items and total count
    const [items, total] = await Promise.all([
      db.gallery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' }
      }),
      db.gallery.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error: any) {
    console.error('Get gallery error:', error)

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
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/gallery - Upload new gallery image (accept image URL)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse and validate request body
    const body = await request.json()
    const validation = galleryItemSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { title, description, imageUrl, thumbnailUrl, category, isActive, displayOrder, contentType, isPremium } = validation.data

    // Get the highest display order if not provided
    let finalDisplayOrder = displayOrder
    if (finalDisplayOrder === undefined) {
      const maxOrder = await db.gallery.findFirst({
        select: { displayOrder: true },
        orderBy: { displayOrder: 'desc' }
      })
      finalDisplayOrder = (maxOrder?.displayOrder ?? 0) + 1
    }

    // Create gallery item
    const galleryItem = await db.gallery.create({
      data: {
        title,
        description,
        imageUrl,
        thumbnailUrl,
        category,
        isActive: isActive ?? true,
        displayOrder: finalDisplayOrder,
        contentType: contentType ?? 'image',
        isPremium: isPremium ?? false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Gallery item created successfully',
      data: galleryItem
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create gallery item error:', error)

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
      { error: 'Failed to create gallery item' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/gallery - Update gallery item
 */
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    // Parse and validate request body
    const body = await request.json()
    const validation = galleryItemSchema.partial().safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      )
    }

    // Check if gallery item exists
    const existingItem = await db.gallery.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Update gallery item
    const updatedItem = await db.gallery.update({
      where: { id },
      data: validation.data
    })

    return NextResponse.json({
      success: true,
      message: 'Gallery item updated successfully',
      data: updatedItem
    })
  } catch (error: any) {
    console.error('Update gallery item error:', error)

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
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/gallery - Delete gallery item
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin authentication
    await verifyAdminAuth(request)

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Gallery item ID is required' },
        { status: 400 }
      )
    }

    // Check if gallery item exists
    const existingItem = await db.gallery.findUnique({
      where: { id }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    // Delete gallery item
    await db.gallery.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Gallery item deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete gallery item error:', error)

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
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}
