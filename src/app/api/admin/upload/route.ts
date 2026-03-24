import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { verifyAdminAuth } from '../helpers'

export async function POST(request: NextRequest) {
  try {
    await verifyAdminAuth(request)

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const isVideo = file.type.startsWith('video/')
    const isImage = file.type.startsWith('image/')

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: 'Only image or video files allowed' }, { status: 400 })
    }

    // Free content mein video allowed nahi
    const isPremium = formData.get('isPremium')
    if (isVideo && isPremium !== 'true') {
      return NextResponse.json({ error: 'Videos only allowed for premium content' }, { status: 400 })
    }

    const maxSize = isVideo ? 500 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: `File too large. Max: ${isVideo ? '500MB' : '10MB'}` }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    if (isVideo) {
      // Videos: save to disk
      const ext = file.name.split('.').pop() || 'mp4'
      const filename = `video-${Date.now()}.${ext}`
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'videos')

      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      await writeFile(join(uploadDir, filename), buffer)

      return NextResponse.json({
        success: true,
        url: `/uploads/videos/${filename}`
      })
    } else {
      // Images: base64 (small enough)
      const base64 = buffer.toString('base64')
      const dataUrl = `data:${file.type};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl
      })
    }
  } catch (error: any) {
    console.error('Upload error:', error)
    if (['Not authenticated', 'Invalid token', 'Token expired'].includes(error.message)) {
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    return NextResponse.json({ error: `Upload failed: ${error.message}` }, { status: 500 })
  }
}
