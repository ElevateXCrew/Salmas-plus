import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await db.gallery.findUnique({
      where: { id: params.id },
      select: { imageUrl: true, contentType: true }
    })

    if (!item?.imageUrl) {
      return new NextResponse('Not found', { status: 404 })
    }

    // Regular URL - redirect
    if (!item.imageUrl.startsWith('data:')) {
      return NextResponse.redirect(item.imageUrl)
    }

    // Fix: use indexOf to split instead of regex (handles newlines in base64)
    const commaIndex = item.imageUrl.indexOf(',')
    if (commaIndex === -1) return new NextResponse('Invalid data', { status: 400 })

    const header = item.imageUrl.substring(0, commaIndex) // e.g. "data:video/mp4;base64"
    const mimeMatch = header.match(/^data:([^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'

    // Remove all whitespace/newlines from base64 string before decoding
    const base64Data = item.imageUrl.substring(commaIndex + 1).replace(/\s/g, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const totalSize = buffer.length

    const rangeHeader = request.headers.get('range')

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 2 * 1024 * 1024, totalSize - 1)
      const chunkSize = end - start + 1

      return new NextResponse(buffer.slice(start, end + 1), {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${totalSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': String(chunkSize),
          'Content-Type': mimeType,
        }
      })
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(totalSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, max-age=3600',
      }
    })
  } catch (error) {
    console.error('Stream error:', error)
    return new NextResponse('Server error', { status: 500 })
  }
}
