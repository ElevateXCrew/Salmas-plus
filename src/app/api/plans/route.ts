import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parsePlanFeatures(raw: string): { features: string[]; discount: number } {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return { features: parsed as string[], discount: 0 }
    if (parsed && typeof parsed === 'object') {
      const obj = parsed as { features?: string[]; discount?: number }
      return { features: obj.features || [], discount: obj.discount || 0 }
    }
  } catch {}
  return { features: [], discount: 0 }
}

export async function GET(request: NextRequest) {
  try {
    const plans = await db.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' }
    })

    const plansWithParsedFeatures = plans.map(plan => {
      const { features, discount } = parsePlanFeatures(plan.features)
      return { ...plan, features, discount }
    })

    return NextResponse.json({ success: true, plans: plansWithParsedFeatures })
  } catch (error: unknown) {
    console.error('Get plans error:', error)
    return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
  }
}
