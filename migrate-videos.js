const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const db = new PrismaClient()

async function migrate() {
  console.log('Starting migration...')
  
  const videos = await db.gallery.findMany({
    where: { contentType: 'video' },
    select: { id: true, imageUrl: true, title: true }
  })
  
  console.log('Total videos:', videos.length)
  
  for (const v of videos) {
    console.log('Processing:', v.title, '| url type:', v.imageUrl.startsWith('data:') ? 'base64' : 'url')
    
    if (!v.imageUrl.startsWith('data:')) {
      console.log('Already disk URL, skipping')
      continue
    }
    
    const ci = v.imageUrl.indexOf(',')
    const base64str = v.imageUrl.substring(ci + 1)
    console.log('base64 length:', base64str.length)
    
    const buf = Buffer.from(base64str, 'base64')
    console.log('Buffer size MB:', (buf.length / 1024 / 1024).toFixed(2))
    
    const dir = path.join(process.cwd(), 'public', 'uploads', 'videos')
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    
    const fn = 'video-' + Date.now() + '.mp4'
    const fp = path.join(dir, fn)
    fs.writeFileSync(fp, buf)
    console.log('Saved to:', fp)
    
    await db.gallery.update({
      where: { id: v.id },
      data: { imageUrl: '/uploads/videos/' + fn }
    })
    console.log('DB updated! New URL: /uploads/videos/' + fn)
  }
  
  console.log('Migration complete!')
}

migrate()
  .catch(e => console.error('ERROR:', e))
  .finally(() => db.$disconnect())
