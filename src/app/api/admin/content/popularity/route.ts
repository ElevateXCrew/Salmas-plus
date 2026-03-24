import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '../../helpers'

export async function GET(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') // image, video, all

    // Most viewed content
    let mostViewedContent: any[] = []
    
    if (type === 'all' || !type) {
      mostViewedContent = await db.$queryRaw`
        SELECT 
          c.id,
          c.title,
          c.type,
          c.views,
          c.createdAt,
          cat.name as categoryName,
          c.thumbnailUrl,
          c.status
        FROM Content c
        LEFT JOIN Category cat ON c.categoryId = cat.id
        WHERE c.status = 'active'
        ORDER BY c.views DESC
        LIMIT ${limit}
      `
    } else {
      mostViewedContent = await db.$queryRaw`
        SELECT 
          c.id,
          c.title,
          c.type,
          c.views,
          c.createdAt,
          cat.name as categoryName,
          c.thumbnailUrl,
          c.status
        FROM Content c
        LEFT JOIN Category cat ON c.categoryId = cat.id
        WHERE c.status = 'active'
        AND c.type = ${type}
        ORDER BY c.views DESC
        LIMIT ${limit}
      `
    }

    // Convert BigInt / Decimal to string
    mostViewedContent = mostViewedContent.map(item => ({
      ...item,
      views: item.views.toString(),
      createdAt: item.createdAt.toISOString?.() || item.createdAt
    }))

    const categoryPopularityRaw: any[] = await db.$queryRaw`
      SELECT 
        cat.id,
        cat.name,
        cat.slug,
        COUNT(c.id) as contentCount,
        SUM(c.views) as totalViews,
        AVG(c.views) as avgViews
      FROM Category cat
      LEFT JOIN Content c ON cat.id = c.categoryId
      WHERE c.status = 'active' OR c.status IS NULL
      GROUP BY cat.id, cat.name, cat.slug
      ORDER BY totalViews DESC
    `

    const categoryPopularity = categoryPopularityRaw.map(item => ({
      ...item,
      contentCount: Number(item.contentCount),
      totalViews: item.totalViews.toString(),
      avgViews: Number(item.avgViews)
    }))

    const contentByTypeRaw: any[] = await db.$queryRaw`
      SELECT 
        type,
        COUNT(*) as count,
        SUM(views) as totalViews,
        AVG(views) as avgViews
      FROM Content
      WHERE status = 'active'
      GROUP BY type
    `

    const contentByType = contentByTypeRaw.map(item => ({
      ...item,
      count: Number(item.count),
      totalViews: item.totalViews.toString(),
      avgViews: Number(item.avgViews)
    }))

    const trendingContentRaw: any[] = await db.$queryRaw`
      SELECT 
        c.id,
        c.title,
        c.type,
        c.views,
        c.createdAt,
        cat.name as categoryName,
        c.thumbnailUrl
      FROM Content c
      LEFT JOIN Category cat ON c.categoryId = cat.id
      WHERE c.status = 'active'
      AND c.createdAt >= datetime('now', '-7 days')
      ORDER BY c.views DESC
      LIMIT ${limit}
    `

    const trendingContent = trendingContentRaw.map(item => ({
      ...item,
      views: item.views.toString(),
      createdAt: item.createdAt.toISOString?.() || item.createdAt
    }))

    return NextResponse.json({
      success: true,
      data: {
        mostViewedContent,
        categoryPopularity,
        contentByType,
        trendingContent
      }
    })
  } catch (error: any) {
    console.error('Get content popularity error:', error)

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
      { error: 'Failed to fetch content popularity data' },
      { status: 500 }
    )
  }
}