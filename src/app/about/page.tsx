'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Heart, Sparkles, Camera, MapPin, Star, Crown, Lock, Music, Palette, Plane, Dumbbell } from 'lucide-react'
import Link from 'next/link'

export default function AboutPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        router.push('/login?redirect=/about')
        return
      }
    } catch (error) {
      router.push('/login?redirect=/about')
      return
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold">Login Required</h1>
            <p className="text-muted-foreground">
              Please login to learn more about me
            </p>
            <Button asChild>
              <a href="/login?redirect=/about">Login Now</a>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const interests = [
    { title: "French kiss(if you're my type)" },
    { title: 'Pussy & ass licking' },
    { title: 'Foot fetish' },
    { title: 'Oral without condom' },
    { title: 'Face sitting/69' },
    { title: 'Extreme Fetish' },
    { title: 'Shower sex' },
    { title: 'Watersports' },
  ]

  const premiumCategories = [
    { name: 'Solo', emoji: '💃', description: 'Elegant solo photography sessions' },
    { name: 'Roleplay', emoji: '🎭', description: 'Creative character portrayals' },
    { name: 'Lingerie', emoji: '👙', description: 'Sophisticated lingerie collections' },
    { name: 'Outdoor', emoji: '🌳', description: 'Beautiful outdoor locations' },
    { name: 'Dance', emoji: '💃', description: 'Graceful dance performances' },
    { name: 'Cosplay', emoji: '🎀', description: 'Fun costume transformations' },
    { name: 'Fitness', emoji: '💪', description: 'Health and wellness content' },
    { name: 'Travel', emoji: '✈️', description: 'Adventures from around the world' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero-bg.png")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
              About Me
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Hello, I'm Salmas
              <span className="block mt-2 bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                
              </span>
            </h1>
            <p 
  className="text-6xl text-white font-bold" 
  style={{ textShadow: "0 0 10px rgba(255,80,80,0.7)" }}
>
  High Class Independent Escort in <span className="font-semibold">Birmingham</span>
</p>
          </div>
        </div>
      </section>

      {/* Personal Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <Badge className="px-10 py-4  text-lg font-large bg-primary/10 text-primary">
                My Story
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                Welcome to My World
              </h2>
              <div className="space-y-4 text-lg text-muted-foreground leading-relaxed">
                
                <p 
  className="text-xl text-white font-semibold" 
  style={{ textShadow: "0 0 8px rgba(255,80,80,0.6)" }}
>
  <span className="font-bold">Hey, You.</span> <span className="font-bold">Yes, You!</span>
</p>
                <p>
                Are you looking for an intelligent, passionate companion to create unforgettable memories with? Someone whose charm, energy, and elegance leave a lasting impression? Meet me once — and the experience will stay with you.
                </p>
                <p 
  className="text-lg text-white" 
  style={{ textShadow: "0 0 8px rgba(255,80,80,0.6)" }}
>
  I’m <span className="font-bold">Salmas</span>, and I’m not your typical escort — but there’s only one way to truly find out.  
  I welcome you to my <span className="font-bold">discreet and stylish incall location</span> in <span className="font-bold">Birmingham, Manchester, and London</span>, a beautifully designed modern space created for <span className="font-bold">comfort and private moments</span>.
</p>
                <p>
                  I’m a vibrant fashion model with an adventurous spirit. My passion for fashion, travel, and the arts takes me across Europe and the Middle East — exploring new cultures, stylish scenes, and unforgettable destinations.
                </p>
                <p>
                  Fashion is a big part of who I am. I love experimenting with colors, textures, and bold styles, and my wardrobe reflects my energetic personality.
                </p>
                <p>
                  But beyond the glamour and travel, what matters most to me is real connection. I enjoy meeting open-minded people who appreciate great conversation, laughter, and meaningful experiences.
                </p>
                <p>
                  Curious to see more?
Explore my exclusive photos, adventures, and behind-the-scenes content on my personal website.
                </p>
                <p>
I offer incalls, outcalls, and Fly Me To You (FMTY) experiences worldwide. I love traveling and creating unforgettable moments wherever the journey takes us.
                </p>
                <p>
                  Curious to see more?
Explore my exclusive photos, adventures, and behind-the-scenes content on my personal website.
                </p>
                <p 
  className="text-lg text-white" 
  style={{ textShadow: "0 0 8px rgba(255,80,80,0.6)" }}
>
  <strong>Please note:</strong> advance bookings are preferred, as 
  <strong> same-day appointments</strong> are rarely available.
</p>
                <p 
  className="text-lg text-white font-semibold" 
  style={{ textShadow: "0 0 8px rgba(255,80,80,0.6)" }}
>
  Let’s create <span className="font-bold">something special</span> together. <span className="font-bold">Are you ready?</span>
</p>
              </div>
              <Button size="lg" className="mt-6" asChild>
                <Link href="/premium">
                  <Crown className="mr-2 h-5 w-5" />
                  Explore Premium Content
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <img src="/images/about.png" alt="About" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold">Age 26</div>
                    <div className="text-sm text-muted-foreground">UK Based</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interests Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary">
              My Passions
            </Badge>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              What I Love
            </h2>
            <p 
  className="text-2xl text-white font-bold" 
  style={{ textShadow: "0 0 10px rgba(255,80,80,0.7)" }}
>
  The things that <span className="font-semibold">inspire me</span> and <span className="font-semibold">fuel my creativity</span>
</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {interests.map((interest, index) => {
              return (
                <Card
                  key={index}
                  className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <CardContent className="p-6 text-center space-y-4">
                    <h3 className="text-xl font-semibold">{interest.title}</h3>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}