'use client'

import { useState, useEffect } from 'react'
import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Check, X, Sparkles, Crown, Zap, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { PlanSelection } from './plan-selection'

interface Plan {
  id: string
  name: string
  price: number
  currency: string
  duration: string
  features: string[]
  isActive: boolean
}

interface FAQ {
  question: string
  answer: string
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  const faqs: FAQ[] = [
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for annual plans.'
    },
    {
      question: 'Can I upgrade or downgrade my plan anytime?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll only pay the prorated difference. When downgrading, the new rate will apply on your next billing cycle.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'We offer a 7-day free trial on all plans. You can explore all features and cancel anytime during the trial period with no charges.'
    },
    {
      question: 'What happens to my content if I cancel?',
      answer: 'Your downloaded content is yours to keep forever. However, you\'ll lose access to new content downloads and premium features after your subscription ends.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with our service, contact us within 30 days for a full refund, no questions asked.'
    },
    {
      question: 'Can I use the content commercially?',
      answer: 'Yes! All our premium content can be used for commercial projects, including client work, marketing materials, and product designs. See our license agreement for details.'
    }
  ]

  useEffect(() => {
    setMounted(true)
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans')
      if (!response.ok) {
        throw new Error('Failed to fetch plans')
      }
      const data = await response.json()
      setPlans(data.plans || [])
    } catch (err) {
      console.error('Error fetching plans:', err)
      setError('Failed to load pricing plans. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getIconForPlan = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('basic')) return Sparkles
    if (name.includes('premium')) return Crown
    if (name.includes('vip')) return Zap
    return Sparkles
  }

  const getColorForPlan = (planName: string) => {
    const name = planName.toLowerCase()
    if (name.includes('basic')) return 'from-amber-500 to-orange-500'
    if (name.includes('premium')) return 'from-purple-500 to-pink-500'
    if (name.includes('vip')) return 'from-cyan-500 to-blue-500'
    return 'from-gray-500 to-gray-600'
  }

  const getPopularPlan = () => {
    return plans.find(plan => plan.name.toLowerCase().includes('premium')) || plans[1]
  }

  const parseFeatures = (featuresData: string | string[]): string[] => {
    // If features is already an array, return it as-is
    if (Array.isArray(featuresData)) {
      return featuresData
    }
    
    // If it's a string, try to parse as JSON first
    try {
      const parsed = JSON.parse(featuresData)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // If JSON parsing fails, split by comma
      return featuresData.split(',').map(f => f.trim())
    }
    
    // Fallback: return as single-item array
    return [featuresData]
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-24 pb-12 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/hero-bg.png"),'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-5 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <Badge className="px-3 py-1.5 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20">
              Pricing
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              Choose Your
              <span className="block mt-1.5 bg-gradient-to-r from-amber-200 to-pink-200 bg-clip-text text-transparent">
                Get Started
              </span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl mx-auto">
              Flexible pricing options to suit your needs. Upgrade anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading plans...</span>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-lg text-destructive">{error}</p>
              <Button onClick={fetchPlans} className="mt-4" variant="outline">
                Try Again
              </Button>
            </div>
          ) : plans.length === 0 ? (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[
                {
                  name: 'Basic',
                  price: 100,
                  duration: 'monthly',
                  features: ['Access to basic gallery', 'Standard quality images', 'Email support', '1 download per day', 'Ad-free experience'],
                  icon: Sparkles,
                  color: 'from-amber-500 to-orange-500',
                  popular: false
                },
                {
                  name: 'Premium',
                  price: 150,
                  duration: 'monthly',
                  features: ['Access to premium gallery', 'High-quality images', 'Priority support', 'Unlimited downloads', 'Exclusive content', 'Early access to new features'],
                  icon: Crown,
                  color: 'from-purple-500 to-pink-500',
                  popular: true
                },
                {
                  name: 'VIP',
                  price: 200,
                  duration: 'monthly',
                  features: ['All Premium features', 'Ultra HD images', '24/7 dedicated support', 'Custom image requests', 'Personalized content', 'Private gallery access', 'Exclusive events'],
                  icon: Zap,
                  color: 'from-cyan-500 to-blue-500',
                  popular: false
                }
              ].map((plan, index) => {
                const Icon = plan.icon
                return (
                  <Card
                    key={index}
                    className={`relative border-primary shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <div className={`bg-gradient-to-r ${plan.color} text-white px-4 py-1 rounded-full text-sm font-medium`}>
                          Most Popular
                        </div>
                      </div>
                    )}
                    <CardHeader className="text-center pb-8">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                      <CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-white">£{plan.price}</span>
                          <span className="text-muted-foreground">/{plan.duration}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <Button
                        size="lg"
                        className="w-full bg-red-600 hover:bg-red-700 text-white"
                        onClick={() => window.location.href = '/login?redirect=/pricing'}
                      >
                        Get Started
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => {
                const Icon = getIconForPlan(plan.name)
                const popularPlan = getPopularPlan()
                const isPopular = mounted && popularPlan?.id === plan.id
                const features = parseFeatures(plan.features)
                const color = getColorForPlan(plan.name)

                return (
                  <Card
                    key={plan.id}
                    className={`relative border-primary shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000`}
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    {isPopular && (
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
                      <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
                      <CardDescription>
                        <div className="mt-4">
                          <span className="text-4xl font-bold text-white">
                            {plan.currency}{plan.price}
                          </span>
                          <span className="text-muted-foreground">/{plan.duration}</span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <Check className="h-5 w-5 text-white flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-white">{feature}</span>
                        </div>
                      ))}
                    </CardContent>
                    <CardFooter>
                      <PlanSelection plan={plan} />
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
