import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

/**
 * GET /api/admin/categories/[id] - Get single category
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        contents: {
          take: 10,
          orderBy: { displayOrder: 'asc' }
        },
        _count: {
          select: {
            contents: true
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error: any) {
    console.error('Get category error:', error)

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
      { error: 'Failed to fetch category' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/admin/categories/[id] - Update category
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params
    const body = await request.json()

    const allowedFields = ['name', 'slug', 'description', 'icon', 'isActive', 'displayOrder']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Check slug uniqueness if being updated
    if (updateData.slug) {
      const existing = await db.category.findFirst({
        where: {
          slug: updateData.slug,
          NOT: { id }
        }
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    const category = await db.category.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: {
            contents: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: category
    })
  } catch (error: any) {
    console.error('Update category error:', error)

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
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/categories/[id] - Delete category
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyAdminAuth(request)

    const { id } = await params

    // Check if category has content
    const contentCount = await db.content.count({
      where: { categoryId: id }
    })

    if (contentCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with associated content. Please remove or reassign content first.' },
        { status: 400 }
      )
    }

    await db.category.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete category error:', error)

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
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}
