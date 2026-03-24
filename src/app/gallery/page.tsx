'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, ZoomIn, Lock, ZoomOut } from 'lucide-react'

interface GalleryItem {
  id: string
  src: string
  thumbnailUrl?: string
  contentType?: string
  category: string
  title: string
  description: string
}

export default function GalleryPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)
  const [zoom, setZoom] = useState(1)

  useEffect(() => { checkAuthStatus() }, [])
  useEffect(() => { if (user !== null) fetchGallery() }, [user])

  const checkAuthStatus = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        window.location.href = '/login?redirect=/gallery'
      }
    } catch {
      window.location.href = '/login?redirect=/gallery'
    } finally {
      setLoading(false)
    }
  }

  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery?limit=100')
      const data = await res.json()
      if (data.success) {
        setGalleryItems(data.data.map((item: any) => ({
          id: item.id,
          src: item.contentType === 'video' ? `/api/gallery/stream/${item.id}` : item.imageUrl,
          thumbnailUrl: item.thumbnailUrl || null,
          contentType: item.contentType || 'image',
          category: item.category || 'general',
          title: item.title,
          description: item.description || ''
        })))
      }
    } catch {}
  }

  const imageItems = galleryItems.filter(i => i.contentType !== 'video')

  const openLightbox = (item: GalleryItem) => {
    if (item.contentType === 'video') return
    setZoom(1)
    setLightbox(item)
  }

  const closeLightbox = () => { setLightbox(null); setZoom(1) }

  const handlePrev = () => {
    if (!lightbox) return
    const idx = imageItems.findIndex(i => i.id === lightbox.id)
    setLightbox(imageItems[idx === 0 ? imageItems.length - 1 : idx - 1])
    setZoom(1)
  }

  const handleNext = () => {
    if (!lightbox) return
    const idx = imageItems.findIndex(i => i.id === lightbox.id)
    setLightbox(imageItems[idx === imageItems.length - 1 ? 0 : idx + 1])
    setZoom(1)
  }

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    setZoom(prev => Math.min(4, Math.max(1, prev - e.deltaY * 0.002)))
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'ArrowRight') handleNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
      <Footer />
    </div>
  )

  if (!user) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold">Login Required</h1>
          <p className="text-muted-foreground">Please login to access the gallery</p>
          <a href="/login?redirect=/gallery" className="inline-block px-6 py-2 bg-primary text-white rounded-lg">Login Now</a>
        </div>
      </div>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("/images/hero-bg.png")' }}>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">Gallery</Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              Enter a World of Elegance
              <span className="block mt-2 bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">Premium Collection</span>
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Where style, passion, and unforgettable connections come together</p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {galleryItems.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No images found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryItems.map((item, index) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden cursor-pointer border-2 hover:border-primary transition-all duration-500 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:shadow-[0_0_40px_rgba(220,38,38,0.6)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onDoubleClick={() => openLightbox(item)}
                >
                  <div className="relative aspect-square overflow-hidden">
                    {item.contentType === 'video' ? (
                      item.thumbnailUrl ? (
                        <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-2" />
                      ) : (
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                          <svg className="h-12 w-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                        </div>
                      )
                    ) : (
                      <img src={item.src} alt={item.title} className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-125 group-hover:rotate-2" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                      <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.8)] transform scale-0 group-hover:scale-100 transition-all duration-500 delay-100">
                        <ZoomIn className="h-8 w-8 text-white animate-pulse" />
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 transform translate-x-20 group-hover:translate-x-0 transition-transform duration-500">
                      <Badge variant="secondary" className="bg-primary text-white shadow-lg">{item.category}</Badge>
                    </div>
                  </div>
                  <div className="p-4 space-y-2 bg-card group-hover:bg-accent/50 transition-colors duration-500">
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors duration-300">{item.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors duration-300">{item.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Fullscreen Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onWheel={handleWheel}
        >
          {/* Prev */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-colors"
          >&#8592;</button>

          {/* Next */}
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center text-xl transition-colors"
          >&#8594;</button>

          {/* Close */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Zoom controls */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => setZoom(p => Math.min(4, p + 0.5))}
              className="w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ZoomIn className="h-5 w-5" />
            </button>
            <button
              onClick={() => setZoom(p => Math.max(1, p - 0.5))}
              className="w-11 h-11 bg-white/10 hover:bg-white/25 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="w-11 h-11 bg-white/10 text-white rounded-full flex items-center justify-center text-sm font-medium">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          {/* Image */}
          <div className="w-full h-full flex items-center justify-center overflow-hidden">
            <img
              src={lightbox.src}
              alt={lightbox.title}
              className="max-w-full max-h-full object-contain transition-transform duration-150 select-none"
              style={{ transform: `scale(${zoom})` }}
              draggable={false}
            />
          </div>

          {/* Info bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-5 pointer-events-none">
            <h3 className="text-white text-lg font-bold">{lightbox.title}</h3>
            {lightbox.description && <p className="text-white/60 text-sm mt-1">{lightbox.description}</p>}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
