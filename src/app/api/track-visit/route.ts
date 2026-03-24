import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json().catch(() => ({ path: '/' }))

    // cookie se visitor id lo, nahi hai toh naya banao
    let visitorId = request.cookies.get('visitor-id')?.value
    const isNew = !visitorId
    if (!visitorId) visitorId = crypto.randomUUID()

    await db.siteVisit.create({
      data: { id: crypto.randomUUID(), visitorId, path: path || '/' }
    })

    const res = NextResponse.json({ success: true })
    if (isNew) {
      res.cookies.set('visitor-id', visitorId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 365, // 1 saal
        path: '/',
        sameSite: 'lax',
      })
    }
    return res
  } catch {
    return NextResponse.json({ success: false })
  }
}
