'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, Star, ArrowRight, Sparkles, Crown, Zap, Heart, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  duration: string
  features: string[]
  discount: number
  isActive: boolean
}

export default function Home() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [plansLoading, setPlansLoading] = useState(true)

  useEffect(() => {
    fetch('/api/plans')
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d.plans) })
      .catch(() => {})
      .finally(() => setPlansLoading(false))
  }, [])

  const getIconForPlan = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('basic')) return Sparkles
    if (n.includes('premium')) return Crown
    if (n.includes('vip')) return Zap
    return Sparkles
  }

  const getColorForPlan = (name: string) => {
    const n = name.toLowerCase()
    if (n.includes('basic')) return 'from-amber-500 to-orange-500'
    if (n.includes('premium')) return 'from-purple-500 to-pink-500'
    if (n.includes('vip')) return 'from-cyan-500 to-blue-500'
    return 'from-gray-500 to-gray-600'
  }

  const isPopularPlan = (name: string) => name.toLowerCase().includes('premium')

  const testimonials = [
    {
      name: 'Alexandra M.',
      role: 'Creative Professional',
      content: 'The premium gallery is absolutely incredible! The quality and variety have taken my projects to the next level. Highly recommend!',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
      name: 'Jordan K.',
      role: 'Digital Artist',
      content: 'Worth every penny! The exclusive content and fast access make this an essential resource for my daily work.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    {
      name: 'Taylor R.',
      role: 'Content Creator',
      content: 'Amazing platform with top-notch quality. The VIP membership gives me everything I need to stand out.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    }
  ]

  const galleryItems = [
    { src: '/images/gallery-1.png', heading: '', button: '' },
    { src: '/images/gallery-2.png', heading: '', button: '' },
    { src: '/images/gallery-3.png', heading: '', button: '' },
    { src: '/images/gallery-4.png', heading: '', button: '' }
  ]

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero-bg.png")',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              Welcome to my <span className="bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">Fans Page</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto font-bold tracking-tight">
              For More contant Please Subscribe to get regular weekly updates 
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-6 h-auto bg-primary text-white hover:bg-primary/90 border border-white/30" asChild>
                <Link href="/premium">
                  Subscribe Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 h-auto text-white border-white/30 bg-primary hover:bg-primary/90 hover:text-white"
                asChild
              >
                <Link href="https://wa.me/+447348207570" target="_blank" rel="noopener noreferrer">
                  Book Now..
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2" />
          </div>
        </div>
      </section>

      {/* Gallery Preview Section */}
      <section id="gallery" className="py-8 sm:py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-6">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Gallery
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Explore Our Premium Collection
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover stunning visuals crafted by professionals for your creative projects
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all hover:scale-150 hover:z-50 hover:shadow-[0_0_60px_rgba(220,38,38,0.9)]"
                style={{ 
                  animationDelay: `${index * 100}ms`,
                  transformOrigin: 'left center'
                }}
              >
                <img
                  src={item.src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:rotate-3"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                  <h3 className="text-white text-3xl font-bold transform -translate-y-10 group-hover:translate-y-0 transition-all duration-700 delay-100">
                    {item.heading}
                  </h3>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" variant="outline" asChild>
              <Link href="/premium">
                View Full Gallery
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview Section */}
      <section id="about Me" className="py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
                About Me
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-center">
                High Class Independent Escort in Birmingham
              </h2>
              <p className="text-2xl font-bold tracking-tight text-muted-foreground leading-relaxed text-center">
              Iâ€™m a very sexy, confident girl with plenty of experience. 
            So many beautiful memories and amazing moments are waiting for you.
              </p>
              
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-1000">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <video
                  src="/video/intro-video.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  loop
                  muted
                  playsInline
                >
                  Your browser does not support the video tag.
                </video>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-xl border">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Rates Section */}
      <section id="booking" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6 mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              ðŸ’‹ My Booking Rates ðŸ’‹
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Spend Beautiful Time With Me
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Ready to experience unforgettable moments? If you want to enjoy amazing time with me and have the ultimate pleasure, 
              <span className="text-primary font-semibold">click Book Now</span> and message me on WhatsApp to book your perfect moment! ðŸ’•
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Incall Section */}
            <div className="group relative bg-card backdrop-blur-sm rounded-3xl p-8 shadow-2xl border hover:shadow-xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    ðŸ  Incall Experience
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Come to My Place</h3>
                  <p className="text-muted-foreground">Intimate moments in my cozy, private space</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">Up to 1 hour</span>
                    <span className="text-2xl font-bold text-primary">Â£200</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">Up to 2 hours</span>
                    <span className="text-2xl font-bold text-primary">Â£400</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <span className="font-medium">Overnight (8 Hours)</span>
                    <span className="text-2xl font-bold text-primary">Â£1,500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <span className="font-medium">Overnight (12 Hours)</span>
                    <span className="text-2xl font-bold text-primary">Â£2,000</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30">
                    <span className="font-medium">One Week</span>
                    <span className="text-2xl font-bold text-primary">Â£15,000</span>
                  </div>
                </div>
                
                <div className="mt-6 p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-sm text-primary font-medium">Minimum duration: 1 hour</p>
                </div>
              </div>
            </div>

            {/* Outcall Section */}
            <div className="group relative bg-card backdrop-blur-sm rounded-3xl p-8 shadow-2xl border hover:shadow-xl transition-all duration-500 hover:scale-105">
              <div className="absolute inset-0 bg-primary/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
                    ðŸš— Outcall Experience
                  </div>
                  <h3 className="text-3xl font-bold mb-2">I Come to You</h3>
                  <p className="text-muted-foreground">Exclusive moments at your preferred location</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">Up to 1 hour</span>
                    <span className="text-2xl font-bold text-primary">Â£250</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-muted/50 rounded-xl">
                    <span className="font-medium">Up to 2 hours</span>
                    <span className="text-2xl font-bold text-primary">Â£500</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <span className="font-medium">Overnight (8 Hours)</span>
                    <span className="text-2xl font-bold text-primary">Â£1,800</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl border-2 border-primary/20">
                    <span className="font-medium">Overnight (12 Hours)</span>
                    <span className="text-2xl font-bold text-primary">Â£2,200</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-primary/20 rounded-xl border-2 border-primary/30">
                    <span className="font-medium">One Week</span>
                    <span className="text-2xl font-bold text-primary">Â£15,000</span>
                  </div>
                </div>
                
                <div className="mt-6 p-3 bg-primary/10 rounded-lg text-center space-y-1">
                  <p className="text-sm text-primary font-medium">Minimum duration: 1 hour</p>
                  <p className="text-xs text-muted-foreground">Transport cost (2 ways) required</p>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <Button size="lg" className="text-xl px-12 py-6 h-auto bg-primary hover:bg-primary/90 text-white shadow-2xl hover:shadow-primary/50 transform hover:scale-105 transition-all duration-300" asChild>
              <Link href="https://wa.me/+447348207570" target="_blank" rel="noopener noreferrer">
                <span className="mr-3 text-2xl">ðŸ’•</span>
                Book Now on WhatsApp
                <span className="ml-3 text-2xl">ðŸ’•</span>
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              Click to message me directly and book your unforgettable experience! ðŸ”¥
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <div className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              Pricing
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Choose Your Perfect Plan
            </h2>
            <p className="text-lg text-muted-foreground">
              Flexible pricing options to suit your needs. Upgrade anytime.
            </p>
          </div>

          {plansLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const Icon = getIconForPlan(plan.name)
                const color = getColorForPlan(plan.name)
                const popular = isPopularPlan(plan.name)
                const discountedPrice = plan.discount > 0 ? plan.price * (1 - plan.discount / 100) : null
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${
                      popular ? 'border-primary shadow-2xl scale-105 z-10' : 'border-border'
                    } animate-in fade-in slide-in-from-bottom-8 duration-1000`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className={`bg-gradient-to-r ${color} text-white px-4 py-1 rounded-full text-sm font-medium`}>
                          Most Popular
                        </div>
                      </div>
                    )}
                    <CardHeader className="text-center pb-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl">{plan.name}</CardTitle>
                      <CardDescription>
                        <div className="mt-4">
                          {discountedPrice ? (
                            <>
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-lg text-muted-foreground line-through">{plan.currency}{plan.price}</span>
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{plan.discount}% OFF</span>
                              </div>
                              <span className="text-4xl font-bold text-green-500">{plan.currency}{discountedPrice.toFixed(2)}</span>
                              <span className="text-muted-foreground">/{plan.duration}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-4xl font-bold">{plan.currency}{plan.price}</span>
                              <span className="text-muted-foreground">/{plan.duration}</span>
                            </>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button
                        className={`w-full ${popular ? `bg-gradient-to-r ${color} hover:opacity-90` : ''}`}
                        variant={popular ? 'default' : 'outline'}
                        size="lg"
                        asChild
                      >
                        <Link href="/signup">
                          {popular ? 'Get Started' : 'Choose Plan'}
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
       <Footer />
    </div>
  )
}
