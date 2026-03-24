# Premium Website - Complete Production-Level Application

A modern, elegant, and fully functional premium subscription website built with Next.js 16, TypeScript, Prisma, and shadcn/ui.

## 🌟 Features

### Public Pages
- **Home Page** - Hero section, about preview, gallery preview, pricing plans, testimonials, contact section
- **About Page** - Company story, mission, vision, team members, achievements
- **Gallery Page** - Filterable image gallery with lightbox functionality
- **Pricing Page** - Subscription plans with comparison table and FAQ
- **Contact Page** - Contact form with WhatsApp integration and map

### User Features
- **Authentication** - Secure signup/login with password hashing (bcrypt)
- **User Dashboard** - Profile management and subscription status
- **Premium Content** - Protected content accessible only to approved subscribers
- **Subscription System** - Request, approve, and manage subscriptions

### Admin Panel
- **Dashboard** - Overview with stats and recent activity
- **User Management** - View, activate, and deactivate users
- **Subscription Management** - Approve/reject subscription requests
- **Gallery Management** - Upload, edit, and delete gallery images
- **Message Management** - View and manage contact messages
- **Admin Authentication** - Secure admin login with separate authentication

## 🚀 Tech Stack

### Core Framework
- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **React 19** - UI library

### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Lucide React** - Icon library
- **Framer Motion** - Animations

### Database & ORM
- **Prisma** - Type-safe ORM
- **SQLite** - Lightweight database (can be upgraded to PostgreSQL/MySQL)

### Authentication & Security
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT-based authentication
- **HTTP-only cookies** - Secure session management

## 📁 Project Structure

```
project/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── page.tsx           # Home page
│   │   ├── about/             # About page
│   │   ├── gallery/           # Gallery page
│   │   ├── pricing/           # Pricing page
│   │   ├── contact/           # Contact page
│   │   ├── login/             # User login
│   │   ├── signup/            # User signup
│   │   ├── dashboard/         # User dashboard
│   │   ├── premium/           # Premium content
│   │   ├── admin/             # Admin panel & login
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication APIs
│   │   │   ├── admin/         # Admin APIs
│   │   │   ├── subscriptions/ # Subscription APIs
│   │   │   ├── plans/         # Plans API
│   │   │   ├── contact/       # Contact API
│   │   │   └── generate-image/ # Image generation API
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── Navigation.tsx     # Navigation component
│   │   └── Footer.tsx         # Footer component
│   ├── lib/
│   │   ├── db.ts              # Prisma client
│   │   └── utils.ts           # Utility functions
│   └── scripts/
│       ├── seed-plans.ts      # Seed subscription plans
│       ├── seed-admin.ts      # Seed admin user
│       └── generate-images.ts # Generate website images
└── public/
    └── images/                # Static images
```

## 🗄️ Database Schema

### Users
- `id`, `email`, `password` (hashed), `name`, `isActive`, `createdAt`, `updatedAt`

### Admins
- `id`, `email`, `password` (hashed), `name`, `isActive`, `createdAt`, `updatedAt`

### Plans
- `id`, `name`, `price`, `currency`, `duration`, `features` (JSON), `isActive`, `createdAt`, `updatedAt`

### Subscriptions
- `id`, `userId`, `planId`, `status` (pending/approved/rejected/expired/cancelled), `startDate`, `endDate`, `requestDate`, `approvedAt`, `rejectedAt`, `createdAt`, `updatedAt`

### Gallery
- `id`, `title`, `description`, `imageUrl`, `thumbnailUrl`, `category`, `isActive`, `displayOrder`, `createdAt`, `updatedAt`

### Contact Messages
- `id`, `userId` (optional), `name`, `email`, `subject`, `message`, `isRead`, `createdAt`, `updatedAt`

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- Bun (recommended) or npm

### Installation

1. **Install dependencies**
   ```bash
   bun install
   ```

2. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./db/custom.db"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   ADMIN_EMAIL="admin@yourdomain.com"
   ADMIN_PASSWORD="your-admin-password"
   ```

3. **Initialize database**
   ```bash
   bun run db:push
   ```

4. **Seed initial data**
   ```bash
   # Seed subscription plans
   bun run src/scripts/seed-plans.ts

   # Seed admin user
   bun run src/scripts/seed-admin.ts

   # Generate website images (optional)
   bun run src/scripts/generate-images.ts
   ```

5. **Run development server**
   ```bash
   bun run dev
   ```

6. **Access the application**
   - Website: `http://localhost:3000`
   - Admin Panel: `http://localhost:3000/admin`

### Default Admin Credentials
```
Email: admin@brandname.com
Password: admin123456
```

**⚠️ IMPORTANT**: Change the admin password after first login!

## 🔐 Security Features

- **Password Hashing** - All passwords hashed with bcrypt (12 rounds)
- **JWT Authentication** - Secure token-based authentication
- **HTTP-only Cookies** - Prevents XSS attacks
- **Input Validation** - Zod schema validation on all APIs
- **SQL Injection Protection** - Prisma ORM prevents SQL injection
- **CS Protection** - Cookie security settings
- **Session Management** - Secure session handling with expiration

## 📝 API Endpoints

### Authentication (`/api/auth`)
- `POST /auth/signup` - User registration
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Admin Authentication (`/api/admin/auth`)
- `POST /admin/auth/login` - Admin login
- `POST /admin/auth/logout` - Admin logout
- `GET /admin/auth/me` - Get current admin

### Plans (`/api/plans`)
- `GET /plans` - Get all active plans

### Subscriptions (`/api/subscriptions`)
- `GET /subscriptions` - Get user subscriptions
- `POST /subscriptions` - Create subscription request

### Admin APIs (`/api/admin`)
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/users` - List users
- `PATCH /admin/users` - Update user status
- `GET /admin/subscriptions` - List all subscriptions
- `PATCH /admin/subscriptions/[id]` - Approve/reject subscription
- `GET /admin/gallery` - List gallery items
- `POST /admin/gallery` - Add gallery item
- `PATCH /admin/gallery/[id]` - Update gallery item
- `DELETE /admin/gallery/[id]` - Delete gallery item
- `GET /admin/messages` - List contact messages
- `PATCH /admin/messages/[id]` - Update message status
- `DELETE /admin/messages/[id]` - Delete message

### Contact (`/api/contact`)
- `POST /contact` - Submit contact form

## 🎨 UI/UX Features

- **Responsive Design** - Mobile-first approach
- **Dark Mode Support** - Theme switching capability
- **Smooth Animations** - Framer Motion transitions
- **Loading States** - Spinners and skeleton screens
- **Error Handling** - User-friendly error messages
- **Form Validation** - Real-time feedback
- **Toast Notifications** - Action feedback
- **Sticky Footer** - Always visible footer
- **Smooth Scrolling** - Animated scroll behavior
- **Mobile Menu** - Responsive navigation

## 📦 Subscription Plans

### Basic Plan ($9.99/month)
- Access to basic gallery
- Standard quality images
- Email support
- 1 download per day
- Ad-free experience

### Premium Plan ($24.99/month) - Most Popular
- Access to premium gallery
- High-quality images
- Priority support
- Unlimited downloads
- Exclusive content
- Early access to new features

### VIP Plan ($49.99/month)
- All Premium features
- Ultra HD images
- 24/7 dedicated support
- Custom image requests
- Personalized content
- Private gallery access
- Exclusive events

## 🚀 Deployment
 
### Production Build
```bash
bun run build
```

### Start Production Server
```bash
bun run start
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
JWT_SECRET="your-production-jwt-secret"
NODE_ENV="production"
```

## 📄 License

This project is a premium website template. All rights reserved.

## 🤝 Support

For support, please contact:
- Email: hello@brandname.com
- WhatsApp: +1 (234) 567-890

## 🙏 Acknowledgments

- **Next.js** - The React framework
- **shadcn/ui** - Beautiful UI components
- **Prisma** - Type-safe database toolkit
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide** - Beautiful icons

---

Built with ❤️ using Next.js 16, TypeScript, and modern web technologies.
#   F a h e e m a w e b s i t e S i r S u l t a n  
 