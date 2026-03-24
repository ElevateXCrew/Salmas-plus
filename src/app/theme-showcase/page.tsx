'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Star, Zap, Flame, Sparkles, Crown, Rocket, Diamond } from "lucide-react"

export default function ThemeShowcase() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-bold neon-red-text flex items-center justify-center gap-4">
            <span className="emoji-bounce">🔥</span>
            Red-Gray Theme Showcase
            <span className="emoji-rotate">💎</span>
          </h1>
          <p className="text-xl text-muted-foreground flex items-center justify-center gap-2">
            <span className="emoji-pulse">✨</span>
            Sexy hover effects aur attractive animations
            <span className="emoji-shake">⚡</span>
          </p>
        </div>

        {/* Icon Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red flex items-center gap-3">
            <span className="emoji-glow">💎</span>
            Sexy Icon Effects
          </h2>
          <div className="flex flex-wrap gap-8 justify-center p-8 bg-card rounded-xl">
            <Heart className="w-12 h-12 icon-bounce cursor-pointer" />
            <Star className="w-12 h-12 icon-spin cursor-pointer" />
            <Zap className="w-12 h-12 icon-pulse-glow cursor-pointer" />
            <Flame className="w-12 h-12 icon-shake cursor-pointer" />
            <Sparkles className="w-12 h-12 icon-flip cursor-pointer" />
            <Crown className="w-12 h-12 icon-scale-rotate cursor-pointer" />
            <Rocket className="w-12 h-12 icon-neon cursor-pointer" />
            <Diamond className="w-12 h-12 icon-pulse-glow cursor-pointer" />
          </div>
        </section>

        {/* Emoji Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red flex items-center gap-3">
            <span className="emoji-rotate">🎯</span>
            Emoji Animations
          </h2>
          <div className="flex flex-wrap gap-8 justify-center p-8 bg-card rounded-xl">
            <span className="emoji-bounce cursor-pointer">🔥</span>
            <span className="emoji-rotate cursor-pointer">💎</span>
            <span className="emoji-pulse cursor-pointer">⚡</span>
            <span className="emoji-shake cursor-pointer">✨</span>
            <span className="emoji-glow cursor-pointer">💖</span>
            <span className="emoji-bounce cursor-pointer">🚀</span>
            <span className="emoji-rotate cursor-pointer">👑</span>
            <span className="emoji-pulse cursor-pointer">💫</span>
          </div>
        </section>

        {/* Image Hover Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red flex items-center gap-3">
            <span className="emoji-pulse">🖼️</span>
            Image Hover Effects
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="image-hover-zoom">
              <img src="/images/gallery-1.png" alt="Zoom Effect" className="w-full h-64 object-cover" />
              <div className="p-4 bg-card">
                <p className="text-center font-semibold">Zoom & Glow</p>
              </div>
            </div>
            <div className="image-overlay">
              <img src="/images/gallery-2.png" alt="Overlay Effect" className="w-full h-64 object-cover" />
              <div className="p-4 bg-card">
                <p className="text-center font-semibold">Red Overlay</p>
              </div>
            </div>
            <div className="image-neon-glow">
              <img src="/images/gallery-3.png" alt="Neon Glow" className="w-full h-64 object-cover" />
              <div className="p-4 bg-card">
                <p className="text-center font-semibold">Neon Glow</p>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Button Effects</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Default Button</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Card Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Premium Card</CardTitle>
                <CardDescription>Hover karo aur dekho magic!</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ye card hover pe lift hota hai with red glow effect.</p>
              </CardContent>
            </Card>

            <Card className="card-3d">
              <CardHeader>
                <CardTitle>3D Card</CardTitle>
                <CardDescription>3D transform effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Hover karo aur 3D rotation dekho!</p>
              </CardContent>
            </Card>

            <Card className="glow-border">
              <CardHeader>
                <CardTitle>Glowing Border</CardTitle>
                <CardDescription>Animated border glow</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Border animated hai continuously!</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Text Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Text Effects</h2>
          <div className="space-y-4">
            <p className="text-4xl font-bold neon-red-text">Neon Red Glow Text</p>
            <p className="text-4xl font-bold gradient-text-red">Gradient Animated Text</p>
            <p className="text-4xl font-bold red-text-glow">Red Shadow Text</p>
          </div>
        </section>

        {/* Background Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Background Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-red-animated h-64 rounded-xl flex items-center justify-center">
              <p className="text-2xl font-bold text-white">Animated Gradient</p>
            </div>
            <div className="red-gradient-radial h-64 rounded-xl flex items-center justify-center">
              <p className="text-2xl font-bold text-white">Radial Gradient</p>
            </div>
          </div>
        </section>

        {/* Hover Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Advanced Hover Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>Hover Lift</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Simple lift effect</p>
              </CardContent>
            </Card>

            <Card className="red-shine">
              <CardHeader>
                <CardTitle>Shine Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Shine animation</p>
              </CardContent>
            </Card>

            <Card className="ripple-effect">
              <CardHeader>
                <CardTitle>Ripple Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Ripple on hover</p>
              </CardContent>
            </Card>

            <Card className="glitch">
              <CardHeader>
                <CardTitle>Glitch Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Glitch animation</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Animation Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Continuous Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="float-animation">
              <CardHeader>
                <CardTitle>Floating</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Continuously floating</p>
              </CardContent>
            </Card>

            <Card className="pulse-red">
              <CardHeader>
                <CardTitle>Pulse Glow</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Pulsing red glow</p>
              </CardContent>
            </Card>

            <Card className="scale-pulse">
              <CardHeader>
                <CardTitle>Scale Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Scaling animation</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Special Effects */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Special Effects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="red-smoke">
              <CardHeader>
                <CardTitle>Red Smoke</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Smoke effect background</p>
              </CardContent>
            </Card>

            <Card className="scan-line">
              <CardHeader>
                <CardTitle>Scan Line</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">Scanning line animation</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Interactive Buttons */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold gradient-text-red">Interactive Elements</h2>
          <div className="flex flex-wrap gap-4">
            <Button className="btn-press">Press Me</Button>
            <Button className="ripple-effect">Ripple Button</Button>
            <Button className="red-shine">Shine Button</Button>
            <Button className="glitch">Glitch Button</Button>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center py-12">
          <p className="text-2xl font-bold gradient-text-red">
            🔥 Sexy Red-Black Theme Complete! 🔥
          </p>
          <p className="text-muted-foreground mt-2">
            Har component mein attractive hover effects aur animations!
          </p>
        </div>

      </div>
    </div>
  )
}
