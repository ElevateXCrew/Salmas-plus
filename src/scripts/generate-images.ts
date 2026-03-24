import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

const images = [
  {
    prompt: 'Elegant luxury website hero banner, soft gradient background with subtle geometric patterns, modern minimalist design, premium feel, warm colors',
    filename: 'hero-bg.png',
    size: '1440x720'
  },
  {
    prompt: 'Professional portrait photography studio, elegant lighting, modern equipment, high-end setup',
    filename: 'about-image.png',
    size: '1024x768'
  },
  {
    prompt: 'Elegant fashion model portrait, professional photography, studio lighting, premium quality',
    filename: 'gallery-1.png',
    size: '800x800'
  },
  {
    prompt: 'Lifestyle photography, elegant woman in luxury setting, natural lighting, artistic composition',
    filename: 'gallery-2.png',
    size: '800x800'
  },
  {
    prompt: 'Premium fashion editorial shot, model in elegant attire, sophisticated lighting, magazine quality',
    filename: 'gallery-3.png',
    size: '800x800'
  },
  {
    prompt: 'Beautiful portrait photography, soft natural light, elegant composition, professional quality',
    filename: 'gallery-4.png',
    size: '800x800'
  }
]

async function generateImages() {
  const zai = await ZAI.create()
  const publicDir = path.join(process.cwd(), 'public', 'images')

  // Ensure directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }

  for (const image of images) {
    try {
      console.log(`Generating: ${image.filename}...`)

      const response = await zai.images.generations.create({
        prompt: image.prompt,
        size: image.size
      })

      const imageBase64 = response.data[0].base64
      const buffer = Buffer.from(imageBase64, 'base64')
      const filepath = path.join(publicDir, image.filename)
      fs.writeFileSync(filepath, buffer)

      console.log(`✓ Generated: ${image.filename}`)
    } catch (error: any) {
      console.error(`✗ Failed to generate ${image.filename}:`, error.message)
    }
  }

  console.log('\nImage generation complete!')
}

generateImages()
