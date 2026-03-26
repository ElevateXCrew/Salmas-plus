'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function getDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase()
  const w = window.innerWidth
  const hasTouch = navigator.maxTouchPoints > 0

  // iPad (modern iPads report as Macintosh in UA)
  if (/ipad/.test(ua)) return 'tablet'
  if (/macintosh/.test(ua) && hasTouch) return 'tablet'

  // Android tablet: android in UA but NOT mobile
  if (/android/.test(ua) && !/mobile/.test(ua)) return 'tablet'

  // Generic tablet: touch device with wide screen
  if (hasTouch && w >= 768 && w <= 1366 && !/windows nt/.test(ua)) return 'tablet'

  // Mobile phones
  if (/iphone|ipod/.test(ua)) return 'mobile'
  if (/android/.test(ua) && /mobile/.test(ua)) return 'mobile'
  if (/blackberry|opera mini|iemobile|wpdesktop|windows phone|mobile/.test(ua)) return 'mobile'

  // Small screen touch = mobile
  if (hasTouch && w < 768) return 'mobile'

  return 'desktop'
}

export function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return
    fetch('/api/track-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pathname, deviceType: getDeviceType() }),
    }).catch(() => {})
  }, [pathname])

  return null
}
