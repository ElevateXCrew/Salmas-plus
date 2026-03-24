'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

interface Plan {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
}

interface PlanSelectionProps {
  plan: Plan
}

export function PlanSelection({ plan }: PlanSelectionProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubscribe = async () => {
    setIsLoading(true)

    try {
      // Check if user is logged in
      const authResponse = await fetch('/api/auth/me')

      if (!authResponse.ok) {
        router.push('/login?redirect=/pricing')
        return
      }

      // Initialize Stripe
      const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      
      if (!stripePublishableKey) {
        alert('Stripe is not configured. Please contact support.')
        setIsLoading(false)
        return
      }

      const stripe = await loadStripe(stripePublishableKey)

      if (!stripe) {
        alert('Failed to initialize payment system')
        setIsLoading(false)
        return
      }

      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No checkout URL received')
      }
    } catch (err: any) {
      console.error('Checkout error:', err)
      alert(err.message || 'Failed to start checkout. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isPopular = mounted && plan.name.toLowerCase().includes('premium')

  return (
    <Button
      size="lg"
      className="w-full"
      onClick={handleSubscribe}
      disabled={isLoading}
      variant={isPopular ? 'default' : 'outline'}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        isPopular ? 'Get Started' : 'Get Started'
      )}
    </Button>
  )
}
