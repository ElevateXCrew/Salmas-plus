'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Lock, Crown, ArrowRight, Image as ImageIcon, Video, Play, Eye, X, Heart, ZoomIn, ZoomOut } from 'lucide-react'

// Detect URL type and return embed URL
function getEmbedUrl(url: string): { type: 'youtube' | 'drive' | 'vimeo' | 'direct', embedUrl: string } {
  if (!url) return { type: 'direct', embedUrl: url }

  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/)
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` }

  // Google Drive
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
  if (driveMatch) return { type: 'drive', embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview` }
  if (url.includes('drive.google.com/open?id=')) {
    const id = url.split('id=')[1]?.split('&')[0]
    if (id) return { type: 'drive', embedUrl: `https://drive.google.com/file/d/${id}/preview` }
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return { type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` }

  // Direct file or /uploads/ path
  return { type: 'direct', embedUrl: url }
}

function VideoPlayer({ url, thumbnail }: { url: string, thumbnail?: string | null }) {
  const { type, embedUrl } = getEmbedUrl(url)

  if (type === 'direct') {
    return (
      <video
        src={embedUrl}
        poster={thumbnail || undefined}
        controls
        autoPlay
        className="w-full max-h-[80vh] rounded-lg bg-black"
      />
    )
  }

  return (
    <div className="relative w-full rounded-lg overflow-hidden bg-black" style={{ paddingTop: '56.25%' }}>
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

interface UserData {
  hasActiveSubscription: boolean
  currentSubscription: { status: string; plan: { name: string } } | null
}

interface GalleryItem {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl?: string
  category: string
  contentType?: string
  isPremium?: boolean
  displayOrder: number
  views: number
  likes: number
  createdAt: string
}

type ContentType = 'images' | 'videos'

const categories = [
  { id: 'all', name: 'All', emoji: '✨' },
  { id: 'solo', name: 'Solo', emoji: '💃' },
  { id: 'roleplay', name: 'Roleplay', emoji: '🎭' },
  { id: 'bathroom', name: 'Bathroom', emoji: '🛁' },
  { id: 'bedroom', name: 'Bedroom', emoji: '🛏️' },
  { id: 'lingerie', name: 'Lingerie', emoji: '👙' },
  { id: 'outdoor', name: 'Outdoor', emoji: '🌳' },
  { id: 'intimate', name: 'Intimate', emoji: '💋' },
  { id: 'dance', name: 'Dance', emoji: '💃' },
  { id: 'cosplay', name: 'Cosplay', emoji: '🎀' },
  { id: 'bts', name: 'Behind the Scenes', emoji: '🎬' },
  { id: 'shower', name: 'Shower', emoji: '🚿' },
  { id: 'mirror', name: 'Mirror Selfie', emoji: '🪞' },
  { id: 'fitness', name: 'Fitness', emoji: '💪' },
  { id: 'pool', name: 'Pool/Beach', emoji: '🏖️' },
  { id: 'nightout', name: 'Night Out', emoji: '🌙' },
  { id: 'morning', name: 'Morning Vibes', emoji: '☀️' },
  { id: 'cooking', name: 'Cooking', emoji: '👩‍🍳' },
  { id: 'office', name: 'Office', emoji: '💼' },
  { id: 'travel', name: 'Travel', emoji: '✈️' },
  { id: 'special', name: 'Special Requests', emoji: '⭐' },
]

export default function PremiumPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [contentType, setContentType] = useState<ContentType>('images')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({})
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({})
  const [zoom, setZoom] = useState(1)

  useEffect(() => { fetchUser() }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedItem) return
      if (e.key === 'Escape') { setSelectedItem(null); setZoom(1) }
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
      if (e.key === 'ArrowRight') navigateLightbox('next')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedItem, galleryItems])

  useEffect(() => {
    if (user?.hasActiveSubscription) fetchGalleryItems()
  }, [user, selectedCategory, contentType])

  const fetchUser = async () => {
    const start = Date.now()
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' })
      if (res.status === 401 || res.status === 404) {
        window.location.href = '/login?redirect=/premium'
        return
      }
      if (!res.ok) throw new Error('Failed to load user')
      const data = await res.json()
      const userData = data.user
      if (!userData.hasActiveSubscription) {
        window.location.href = '/pricing'
        return
      }
      setUser(userData)
    } catch (err: any) {
      setError(err.message)
    } finally {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 5000 - elapsed)
      setTimeout(() => setLoading(false), remaining)
    }
  }

  const fetchGalleryItems = async () => {
    setGalleryLoading(true)
    try {
      const params = new URLSearchParams({ limit: '100', premium: 'true' })
      if (selectedCategory !== 'all') params.set('category', selectedCategory)
      params.set('contentType', contentType === 'videos' ? 'video' : 'image')
      const res = await fetch(`/api/gallery?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setGalleryItems(data.data)
      const likes: Record<string, number> = {}
      const views: Record<string, number> = {}
      const liked: Record<string, boolean> = {}
      data.data.forEach((item: GalleryItem & { liked?: boolean }) => {
        likes[item.id] = item.likes || 0
        views[item.id] = item.views || 0
        liked[item.id] = item.liked || false
      })
      setLikeCounts(likes)
      setViewCounts(views)
      setLikedItems(liked)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setGalleryLoading(false)
    }
  }

  const navigateLightbox = (dir: 'prev' | 'next') => {
    if (!selectedItem) return
    const idx = galleryItems.findIndex(i => i.id === selectedItem.id)
    const newIdx = dir === 'prev'
      ? (idx === 0 ? galleryItems.length - 1 : idx - 1)
      : (idx === galleryItems.length - 1 ? 0 : idx + 1)
    setSelectedItem(galleryItems[newIdx])
    setZoom(1)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (selectedItem?.contentType === 'video') return
    e.preventDefault()
    setZoom(prev => Math.min(4, Math.max(1, prev - e.deltaY * 0.002)))
  }

  const trackView = async (item: GalleryItem) => {
    setZoom(1)
    setSelectedItem(item)
    if (!item.isPremium) return
    try {
      await fetch(`/api/gallery/${item.id}`, { method: 'POST' })
      setViewCounts(prev => ({ ...prev, [item.id]: (prev[item.id] || 0) + 1 }))
    } catch {}
  }

  const toggleLike = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/gallery/${item.id}`, { method: 'PATCH' })
      const data = await res.json()
      if (data.success) {
        setLikedItems(prev => ({ ...prev, [item.id]: data.liked }))
        setLikeCounts(prev => ({ ...prev, [item.id]: data.likes }))
      }
    } catch {}
  }

  const renderGrid = () => {
    if (galleryLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] bg-muted animate-pulse" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (galleryItems.length === 0) {
      return (
        <div className="text-center py-12">
          <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No content found</h3>
          <p className="text-muted-foreground">No {contentType} available in this category yet</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <Card key={item.id} onClick={() => trackView(item)} className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className="relative aspect-[3/4] overflow-hidden">
              {item.contentType === 'video' ? (
                <>
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                      <Video className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                      <Play className="h-7 w-7 text-white ml-1" />
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="absolute top-2 right-2">
                <Badge variant="secondary" className="text-xs">
                  {categories.find(c => c.id === item.category)?.emoji || '✨'}
                </Badge>
              </div>
            </div>
            <CardContent className="p-3">
              <h3 className="font-medium text-sm mb-2 line-clamp-2">{item.title}</h3>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {viewCounts[item.id] ?? 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className={`h-3 w-3 ${likedItems[item.id] ? 'text-red-500 fill-red-500' : ''}`} />
                    {likeCounts[item.id] ?? 0}
                  </div>
                </div>
                <button
                  onClick={(e) => toggleLike(e, item)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                    likedItems[item.id]
                      ? 'bg-red-500/20 text-red-500'
                      : 'bg-muted hover:bg-red-500/20 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-3 w-3 ${likedItems[item.id] ? 'fill-red-500' : ''}`} />
                  {likedItems[item.id] ? 'Liked' : 'Like'}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <section className="relative pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=1920&q=80")' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">Premium Content</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Exclusive & Premium
              <span className="block mt-2 bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">VIP Collection</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Unlock access to our most exclusive content and premium features</p>
          </div>
        </div>
      </section>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading premium content...</p>
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="max-w-md mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && !user?.hasActiveSubscription && (
            <Card className="max-w-md mx-auto">
              <CardHeader className="text-center">
                <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle>Premium Access Required</CardTitle>
                <CardDescription>You need an active subscription to access premium content</CardDescription>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <Button asChild size="lg">
                  <Link href="/pricing"><Crown className="h-5 w-5 mr-2" />View Subscription Plans</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {!loading && !error && user?.hasActiveSubscription && (
            <>
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  <Crown className="h-4 w-4" />
                  Premium Member
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold">Premium Content</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">Exclusive content across 20 different categories</p>
              </div>

              <Tabs defaultValue="images" className="w-full" onValueChange={(v) => { setContentType(v as ContentType); setSelectedCategory('all') }}>
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="images" className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />Images
                  </TabsTrigger>
                  <TabsTrigger value="videos" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />Videos
                  </TabsTrigger>
                </TabsList>

                <div className="mt-6">
                  <div className="flex gap-2 overflow-x-auto pb-4">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedCategory(category.id)}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        <span>{category.emoji}</span>
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <TabsContent value="images" className="mt-6">{renderGrid()}</TabsContent>
                <TabsContent value="videos" className="mt-6">{renderGrid()}</TabsContent>
              </Tabs>

              <div className="text-center pt-8">
                <Button variant="outline" asChild>
                  <Link href="/dashboard">
                    <ArrowRight className="h-4 w-4 mr-2 rotate-180" />Back to Dashboard
                  </Link>
                </Button>
              </div>

              {selectedItem && (
                <div
                  className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
                  onWheel={handleWheel}
                >
                  {/* Close */}
                  <button
                    onClick={() => { setSelectedItem(null); setZoom(1) }}
                    className="absolute top-4 right-4 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  {/* Zoom controls — images only */}
                  {selectedItem.contentType !== 'video' && (
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <button onClick={() => setZoom(p => Math.min(4, p + 0.5))} className="w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors">
                        <ZoomIn className="h-5 w-5" />
                      </button>
                      <button onClick={() => setZoom(p => Math.max(1, p - 0.5))} className="w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors">
                        <ZoomOut className="h-5 w-5" />
                      </button>
                      <span className="w-11 h-11 bg-white/10 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {Math.round(zoom * 100)}%
                      </span>
                    </div>
                  )}

                  {/* Prev */}
                  <button
                    onClick={() => navigateLightbox('prev')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-colors"
                  >&#8592;</button>

                  {/* Next */}
                  <button
                    onClick={() => navigateLightbox('next')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-colors"
                  >&#8594;</button>

                  {/* Content */}
                  <div className="w-full h-full flex items-center justify-center overflow-hidden px-16">
                    {selectedItem.contentType === 'video' ? (
                      <div className="w-full max-w-4xl">
                        <VideoPlayer url={selectedItem.imageUrl} thumbnail={selectedItem.thumbnailUrl} />
                      </div>
                    ) : (
                      <img
                        src={selectedItem.imageUrl}
                        alt={selectedItem.title}
                        className="max-w-full max-h-full object-contain transition-transform duration-150 select-none"
                        style={{ transform: `scale(${zoom})` }}
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Info bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5 pointer-events-none">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-medium">{selectedItem.title}</p>
                      <div className="flex items-center gap-4 text-white/70 text-sm">
                        <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{viewCounts[selectedItem.id] ?? 0}</span>
                        <span className="flex items-center gap-1"><Heart className={`h-4 w-4 ${likedItems[selectedItem.id] ? 'fill-red-500 text-red-500' : ''}`} />{likeCounts[selectedItem.id] ?? 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
