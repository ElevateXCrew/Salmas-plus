import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    // Parse features from JSON
    const plansWithParsedFeatures = plans.map(plan => ({
      ...plan,
      features: JSON.parse(plan.features)
    }))

    return NextResponse.json({
      success: true,
      plans: plansWithParsedFeatures
    })
  } catch (error: any) {
    console.error('Get plans error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}
