'use client'

import { MessageCircle } from 'lucide-react'
import { usePathname } from 'next/navigation'

export function WhatsAppButton() {
  const pathname = usePathname()
  const phoneNumber = '1234567890' // Replace with actual WhatsApp number

  if (pathname?.startsWith('/admin')) return null

  return (
    <a
      href={`https://wa.me/${phoneNumber}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
