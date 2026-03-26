import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({ path: '/', deviceType: 'desktop' }))
    const path = body.path || '/'
    const deviceType = ['mobile', 'tablet', 'desktop'].includes(body.deviceType) ? body.deviceType : 'desktop'

    let visitorId = request.cookies.get('visitor-id')?.value
    const isNew = !visitorId
    if (!visitorId) visitorId = crypto.randomUUID()

    await db.siteVisit.create({
      data: { id: crypto.randomUUID(), visitorId, path, deviceType }
    })

    const res = NextResponse.json({ success: true })
    if (isNew) {
      res.cookies.set('visitor-id', visitorId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
        sameSite: 'lax',
      })
    }
    return res
  } catch {
    return NextResponse.json({ success: false })
  }
}
