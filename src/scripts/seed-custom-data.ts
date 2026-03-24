import { db } from "../lib/db";

async function main() {
  console.log("🌱 Seeding analytics and content data...");

  // Seed Categories
  console.log("Creating categories...");
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: "portraits" },
      update: {},
      create: {
        name: "Portraits",
        slug: "portraits",
        description: "Beautiful portrait photography",
        isActive: true,
      },
    }),
    db.category.upsert({
      where: { slug: "nature" },
      update: {},
      create: {
        name: "Nature",
        slug: "nature",
        description: "Stunning landscapes and nature",
        isActive: true,
      },
    }),
  ]);

  // Seed Content (Videos and Images)
  console.log("Creating content...");
  await db.content.createMany({
    data: [
      {
        title: "Sunset over the ocean",
        description: "A beautiful sunset captured at the beach.",
        mediaUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b",
        type: "image",
        categoryId: categories[1].id,
        isPremium: false,
        status: "active",
        views: 1250,
      },
      {
        title: "Mountain climbing vlog",
        description: "Follow my journey to the top of the Alps.",
        mediaUrl: "https://example.com/video1.mp4",
        thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
        type: "video",
        categoryId: categories[1].id,
        isPremium: true,
        status: "active",
        views: 450,
      },
      {
        title: "Studio Portrait Session",
        description: "Professional studio lighting setup and results.",
        mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
        type: "image",
        categoryId: categories[0].id,
        isPremium: true,
        status: "active",
        views: 890,
      },
    ],
  });

  // Seed Analytics (Last 7 days)
  console.log("Creating analytics data...");
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);

    // Users
    await db.analytics.create({
      data: {
        metricType: "user",
        metricName: "new_users",
        value: Math.floor(Math.random() * 20),
        timestamp: d,
      },
    });

    // Content Views
    await db.analytics.create({
      data: {
        metricType: "content",
        metricName: "content_views",
        value: Math.floor(Math.random() * 500) + 100,
        timestamp: d,
      },
    });

    // Revenue
    await db.analytics.create({
      data: {
        metricType: "revenue",
        metricName: "revenue",
        value: Math.floor(Math.random() * 100) + 50,
        timestamp: d,
      },
    });
  }

  // Seed Notifications
  console.log("Creating notifications...");
  await db.notification.createMany({
    data: [
      {
        type: "subscriber",
        title: "New Premium Subscriber",
        message: "user1@example.com just upgraded to Premium",
        isRead: false,
      },
      {
        type: "system",
        title: "Database Backup Completed",
        message: "Automated daily backup finished successfully",
        isRead: true,
      },
      {
        type: "payment",
        title: "Payment Received",
        message: "Received $24.99 from user2@example.com",
        isRead: false,
      },
    ]
  });

  console.log("✅ Custom dummy data seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
