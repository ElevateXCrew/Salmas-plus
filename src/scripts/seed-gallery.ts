import { db } from '@/lib/db'

async function seedGallery() {
  try {
    console.log('Seeding gallery...')

    const galleryItems = [
      // Solo category
      {
        title: 'Solo Portrait 1',
        description: 'Beautiful solo portrait',
        imageUrl: '/images/gallery-1.png',
        category: 'solo',
        displayOrder: 1
      },
      {
        title: 'Solo Portrait 2',
        description: 'Elegant solo shot',
        imageUrl: '/images/gallery-2.png',
        category: 'solo',
        displayOrder: 2
      },
      // Roleplay category
      {
        title: 'Roleplay Scene 1',
        description: 'Creative roleplay photography',
        imageUrl: '/images/gallery-3.png',
        category: 'roleplay',
        displayOrder: 3
      },
      {
        title: 'Roleplay Scene 2',
        description: 'Artistic roleplay concept',
        imageUrl: '/images/gallery-4.png',
        category: 'roleplay',
        displayOrder: 4
      },
      // Bathroom category
      {
        title: 'Bathroom Art 1',
        description: 'Artistic bathroom photography',
        imageUrl: '/images/gallery-1.png',
        category: 'bathroom',
        displayOrder: 5
      },
      {
        title: 'Bathroom Art 2',
        description: 'Elegant bathroom scene',
        imageUrl: '/images/gallery-2.png',
        category: 'bathroom',
        displayOrder: 6
      },
      // Bedroom category
      {
        title: 'Bedroom Scene 1',
        description: 'Intimate bedroom photography',
        imageUrl: '/images/gallery-3.png',
        category: 'bedroom',
        displayOrder: 7
      },
      {
        title: 'Bedroom Scene 2',
        description: 'Cozy bedroom atmosphere',
        imageUrl: '/images/gallery-4.png',
        category: 'bedroom',
        displayOrder: 8
      },
      // Lingerie category
      {
        title: 'Lingerie Fashion 1',
        description: 'Elegant lingerie photography',
        imageUrl: '/images/gallery-1.png',
        category: 'lingerie',
        displayOrder: 9
      },
      {
        title: 'Lingerie Fashion 2',
        description: 'Artistic lingerie shoot',
        imageUrl: '/images/gallery-2.png',
        category: 'lingerie',
        displayOrder: 10
      },
      // Bikini category
      {
        title: 'Bikini Beach 1',
        description: 'Beach bikini photography',
        imageUrl: '/images/gallery-3.png',
        category: 'bikini',
        displayOrder: 11
      },
      {
        title: 'Bikini Beach 2',
        description: 'Summer bikini vibes',
        imageUrl: '/images/gallery-4.png',
        category: 'bikini',
        displayOrder: 12
      },
      // Outdoor category
      {
        title: 'Outdoor Nature 1',
        description: 'Natural outdoor photography',
        imageUrl: '/images/gallery-1.png',
        category: 'outdoor',
        displayOrder: 13
      },
      {
        title: 'Outdoor Nature 2',
        description: 'Beautiful outdoor scene',
        imageUrl: '/images/gallery-2.png',
        category: 'outdoor',
        displayOrder: 14
      },
      // Cosplay category
      {
        title: 'Cosplay Character 1',
        description: 'Creative cosplay photography',
        imageUrl: '/images/gallery-3.png',
        category: 'cosplay',
        displayOrder: 15
      },
      {
        title: 'Cosplay Character 2',
        description: 'Detailed cosplay shoot',
        imageUrl: '/images/gallery-4.png',
        category: 'cosplay',
        displayOrder: 16
      },
      // Fetish category
      {
        title: 'Artistic Concept 1',
        description: 'Artistic conceptual photography',
        imageUrl: '/images/gallery-1.png',
        category: 'fetish',
        displayOrder: 17
      },
      {
        title: 'Artistic Concept 2',
        description: 'Creative artistic expression',
        imageUrl: '/images/gallery-2.png',
        category: 'fetish',
        displayOrder: 18
      },
      // Couple category
      {
        title: 'Couple Portrait 1',
        description: 'Romantic couple photography',
        imageUrl: '/images/gallery-3.png',
        category: 'couple',
        displayOrder: 19
      },
      {
        title: 'Couple Portrait 2',
        description: 'Intimate couple session',
        imageUrl: '/images/gallery-4.png',
        category: 'couple',
        displayOrder: 20
      }
    ]

    for (const item of galleryItems) {
      await db.gallery.upsert({
        where: { id: `gallery-${item.displayOrder}` },
        update: item,
        create: {
          id: `gallery-${item.displayOrder}`,
          ...item
        }
      })
      console.log(`✓ Added: ${item.title}`)
    }

    console.log('Gallery seeded successfully!')
  } catch (error) {
    console.error('Error seeding gallery:', error)
  } finally {
    await db.$disconnect()
  }
}

seedGallery()
