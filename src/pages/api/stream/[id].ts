import type { NextApiRequest, NextApiResponse } from 'next'
import db from '@/lib/db'

export const config = {
  api: { responseLimit: false },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query
  if (!id || typeof id !== 'string') return res.status(400).end('Missing id')

  try {
    const item = await db.gallery.findUnique({
      where: { id },
      select: { imageUrl: true, contentType: true }
    })

    if (!item?.imageUrl) return res.status(404).end('Not found')

    if (!item.imageUrl.startsWith('data:')) return res.redirect(item.imageUrl)

    // Fix: use indexOf instead of regex to handle newlines in base64
    const commaIndex = item.imageUrl.indexOf(',')
    if (commaIndex === -1) return res.status(400).end('Invalid data')

    const header = item.imageUrl.substring(0, commaIndex)
    const mimeMatch = header.match(/^data:([^;]+)/)
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream'

    // Remove whitespace/newlines before decoding
    const base64Data = item.imageUrl.substring(commaIndex + 1).replace(/\s/g, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const totalSize = buffer.length

    const rangeHeader = req.headers['range']

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-')
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + 2 * 1024 * 1024, totalSize - 1)
      const chunkSize = end - start + 1

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      })
      return res.end(buffer.slice(start, end + 1))
    }

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Length': totalSize,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
    })
    res.end(buffer)
  } catch (error) {
    console.error('Stream error:', error)
    res.status(500).end('Error')
  }
}
