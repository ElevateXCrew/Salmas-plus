'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, X, User, LogOut, ChevronDown } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    checkAuthStatus()
  }, [])

  useEffect(() => { setMounted(true) }, [])

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch {}
  }

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      checkAuthStatus()
    }
    window.addEventListener('profileUpdated', handleProfileUpdate)
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate)
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Navigation links - always show all links
  const navLinks = [
    { name: 'Home', href: '/', requiresAuth: false },
    { name: 'Gallery', href: '/gallery', requiresAuth: true },
    { name: 'About Me', href: '/about', requiresAuth: true },
    { name: 'Plans', href: '/pricing', requiresAuth: true },
    { name: 'WhatsApp Me', href: 'https://wa.me/+447348207570', external: true, requiresAuth: false },
  ]

  const handleNavClick = (e: React.MouseEvent, link: any) => {
    if (link.requiresAuth && !user) {
      e.preventDefault()
      window.location.href = `/login?redirect=${encodeURIComponent(link.href)}`
    }
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-background/95 backdrop-blur-md shadow-lg gold-border-glow'
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="Salmaa" className="w-10 h-10 rounded-lg object-cover shadow-lg" />
            <span className="text-2xl font-bold tracking-tight gold-text-glow text-primary">
             Salmaa
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                target={link.external ? '_blank' : undefined}
                rel={link.external ? 'noopener noreferrer' : undefined}
                onClick={(e) => handleNavClick(e, link)}
                className="px-4 py-2 text-sm font-medium hover:text-primary transition-colors rounded-md hover:bg-accent"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/premium"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault()
                  window.location.href = '/login?redirect=/premium'
                }
              }}
              className="ml-4 px-6 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 transition-all rounded-md shadow-lg hover:shadow-xl"
            >
              Premium Content
            </Link>
          </div>

          {/* Desktop Auth/User Menu */}
          <div className="hidden md:flex items-center space-x-2 min-w-[160px] justify-end">
            {!mounted ? <div className="w-[160px]" /> : !user ? (
              <>
                <Button variant="ghost" asChild className="gold-button-hover">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="gold-button-hover gold-glow">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-3 py-2 h-auto hover:bg-accent rounded-full transition-all">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImage || undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium max-w-[150px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center gap-3 p-2 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImage || undefined} alt={user.name || 'User'} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => {
                      handleNavClick(e, link)
                      setIsOpen(false)
                    }}
                    className="text-lg font-medium hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-accent"
                  >
                    {link.name}
                  </Link>
                ))}
                <Link
                  href="/premium"
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault()
                      window.location.href = '/login?redirect=/premium'
                    }
                    setIsOpen(false)
                  }}
                  className="text-lg font-bold text-white bg-primary hover:bg-primary/90 transition-all px-4 py-3 rounded-md shadow-lg mx-4"
                >
                  Premium Content
                </Link>
                {user && (
                  <>
                    <div className="flex items-center gap-3 px-4 py-3 border-b">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage || undefined} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="text-lg font-medium hover:text-primary transition-colors px-4 py-2 rounded-md hover:bg-accent"
                    >
                      Dashboard
                    </Link>
                  </>
                )}
                <div className="border-t pt-4 space-y-2">
                  {!mounted ? null : !user ? (
                    <>
                      <Button variant="ghost" className="w-full justify-start" asChild>
                        <Link href="/login">Login</Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  ) : (
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600" 
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
