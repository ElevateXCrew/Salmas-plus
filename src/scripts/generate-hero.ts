import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

async function generateHeroImage() {
  const zai = await ZAI.create()
  const publicDir = path.join(process.cwd(), 'public', 'images')

  // Ensure directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  try {
    console.log('Generating hero-bg.png...')

    const response = await zai.images.generations.create({
      prompt: 'Elegant luxury website hero banner, soft gradient background with subtle geometric patterns, modern minimalist design, premium feel, warm colors',
      size: '1440x768' // Both dimensions must be multiples of 32
    })

    const imageBase64 = response.data[0].base64
    const buffer = Buffer.from(imageBase64, 'base64')
    const filepath = path.join(publicDir, 'hero-bg.png')
    fs.writeFileSync(filepath, buffer)

    console.log('✓ Generated: hero-bg.png')
  } catch (error: any) {
    console.error('✗ Failed to generate hero-bg.png:', error.message)
  }
}

generateHeroImage()
