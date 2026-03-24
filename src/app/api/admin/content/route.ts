import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../helpers'

/**
 * GET /api/admin/content - Get all content with pagination and filters
 */
export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const type = searchParams.get('type') // video, image, all
    const status = searchParams.get('status') // active, hidden, frozen, all
    const isPremium = searchParams.get('isPremium') // true, false, all
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (isPremium && isPremium !== 'all') {
      where.isPremium = isPremium === 'true'
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } }
      ]
    }

    const [contents, total] = await Promise.all([
      db.content.findMany({
        where,
        skip,
        take: limit,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        },
        orderBy: { displayOrder: 'asc' }
      }),
      db.content.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: contents,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
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
 * POST /api/admin/content - Create new content
 */
export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const body = await request.json()
    const {
      title,
      description,
      mediaUrl,
      thumbnailUrl,
      type,
      categoryId,
      isPremium,
      displayOrder
    } = body

    // Validate required fields
    if (!title || !mediaUrl || !type) {
      return NextResponse.json(
        { error: 'Title, media URL, and type are required' },
        { status: 400 }
      )
    }

    if (!['video', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "video" or "image"' },
        { status: 400 }
      )
    }

    const content = await db.content.create({
      data: {
        title,
        description,
        mediaUrl,
        thumbnailUrl,
        type,
        categoryId,
        isPremium: isPremium ?? true,
        displayOrder: displayOrder ?? 0,
        status: 'active'
      },
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
    console.error('Create content error:', error)

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
      { error: 'Failed to create content' },
      { status: 500 }
    )
  }
}
