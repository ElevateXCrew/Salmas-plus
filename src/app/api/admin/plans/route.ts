import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyAdminAuth } from '@/app/api/admin/helpers'

type PlanData = { features: string[]; discount: number }

function parsePlanFeatures(raw: string): PlanData {
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
    await verifyAdminAuth(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const plans = await db.plan.findMany({ orderBy: { price: 'asc' } })
  return NextResponse.json({
    success: true,
    plans: plans.map(p => {
      const { features, discount } = parsePlanFeatures(p.features)
      return { ...p, features, discount }
    })
  })
}

export async function PATCH(request: NextRequest) {
  try {
    await verifyAdminAuth(request)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id, name, price, currency, duration, features, isActive, discount } = await request.json() as {
    id: string; name?: string; price?: string; currency?: string; duration?: string
    features?: string[]; isActive?: boolean; discount?: string
  }
  if (!id) return NextResponse.json({ error: 'Plan ID required' }, { status: 400 })

  const currentPlan = await db.plan.findUnique({ where: { id } })
  if (!currentPlan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 })

  const existing = parsePlanFeatures(currentPlan.features)
  const newFeatures = features !== undefined ? features : existing.features
  const newDiscount = discount !== undefined ? parseFloat(discount) || 0 : existing.discount

  const updateData: Record<string, unknown> = {
    features: JSON.stringify({ features: newFeatures, discount: newDiscount })
  }
  if (name !== undefined) updateData.name = name
  if (price !== undefined) updateData.price = parseFloat(price)
  if (currency !== undefined) updateData.currency = currency
  if (duration !== undefined) updateData.duration = duration
  if (isActive !== undefined) updateData.isActive = isActive

  const plan = await db.plan.update({ where: { id }, data: updateData })
  const ret = parsePlanFeatures(plan.features)

  return NextResponse.json({
    success: true,
    plan: { ...plan, features: ret.features, discount: ret.discount }
  })
}
