'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Image as ImageIcon,
  LogOut,
  Search,
  Plus,
  Loader2,
  TrendingUp,
  DollarSign,
  Activity,
  Settings,
  Menu,
  X,
  BarChart3,
  Trash2,
  CheckCircle,
  XCircle,
  Upload,
  Grid3x3,
  Edit,
} from 'lucide-react'

// Interfaces
interface Admin {
  id: string
  name: string
  email: string
  isActive: boolean
}

interface User {
  id: string
  name: string | null
  email: string
  gender?: string | null
  location?: string | null
  dateOfBirth?: string | null
  isActive: boolean
  createdAt: string
  _count: {
    subscriptions: number
  }
}

interface RevenueData {
  totalRevenue: string
  mrr: string
  revenueByPlan: any[]
  revenueTrend: any[]
  recentTransactions: any[]
  refunds: any
  metrics: any
}

export default function AdminDashboard() {
  const router = useRouter()
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('daily')
  const [metricType, setMetricType] = useState('user')
  const [analyticsDetail, setAnalyticsDetail] = useState<any>(null)
  const [analyticsDetailLoading, setAnalyticsDetailLoading] = useState(false)

  // Likes & Views state
  const [lvData, setLvData] = useState<any>(null)
  const [lvLoading, setLvLoading] = useState(false)

  // Revenue state
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [revenueLoading, setRevenueLoading] = useState(false)

  // Users state
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [userSearch, setUserSearch] = useState('')
  const [userPage, setUserPage] = useState(1)
  const [userTotalPages, setUserTotalPages] = useState(1)
  const [userTotal, setUserTotal] = useState(0)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editForm, setEditForm] = useState({ name: '', email: '' })
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [userActionLoading, setUserActionLoading] = useState(false)

  // Gallery state
  const [galleryItems, setGalleryItems] = useState<any[]>([])
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [showAddGallery, setShowAddGallery] = useState(false)
  const [editingGallery, setEditingGallery] = useState<any | null>(null)
  const [deletingGalleryId, setDeletingGalleryId] = useState<string | null>(null)
  const [galleryActionLoading, setGalleryActionLoading] = useState(false)
  const premiumCategories = [
    { id: 'solo', name: 'Solo' },
    { id: 'roleplay', name: 'Roleplay' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'lingerie', name: 'Lingerie' },
    { id: 'outdoor', name: 'Outdoor' },
    { id: 'intimate', name: 'Intimate' },
    { id: 'dance', name: 'Dance' },
    { id: 'cosplay', name: 'Cosplay' },
    { id: 'bts', name: 'BTS' },
    { id: 'shower', name: 'Shower' },
    { id: 'mirror', name: 'Mirror Selfie' },
    { id: 'fitness', name: 'Fitness' },
    { id: 'pool', name: 'Pool/Beach' },
    { id: 'nightout', name: 'Night Out' },
    { id: 'morning', name: 'Morning Vibes' },
    { id: 'cooking', name: 'Cooking' },
    { id: 'office', name: 'Office' },
    { id: 'travel', name: 'Travel' },
    { id: 'special', name: 'Special Requests' },
  ]

  const [galleryForm, setGalleryForm] = useState({ title: '', description: '', imageUrl: '', thumbnailUrl: '', category: '', isActive: true, contentType: 'image', isPremium: false })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setGalleryForm(p => ({ ...p, imageUrl: data.url }))
      else alert('Upload failed: ' + (data.error || 'Unknown error'))
    } catch (error: any) { alert('Upload error: ' + error.message) }
    finally { setUploadingImage(false) }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!galleryForm.isPremium) {
      alert('Videos only allowed for premium content')
      return
    }
    setUploadingVideo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('isPremium', 'true')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setGalleryForm(p => ({ ...p, imageUrl: data.url }))
      else alert('Upload failed: ' + (data.error || 'Unknown error'))
    } catch (error: any) { alert('Upload error: ' + error.message) }
    finally { setUploadingVideo(false) }
  }

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingThumb(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) setGalleryForm(p => ({ ...p, thumbnailUrl: data.url }))
      else alert('Upload failed: ' + (data.error || 'Unknown error'))
    } catch (error: any) { alert('Upload error: ' + error.message) }
    finally { setUploadingThumb(false) }
  }

  // Subscriptions state
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [subsLoading, setSubsLoading] = useState(false)
  const [subsStatusFilter, setSubsStatusFilter] = useState('all')
  const [subsPage, setSubsPage] = useState(1)
  const [subsTotalPages, setSubsTotalPages] = useState(1)
  const [subsTotal, setSubsTotal] = useState(0)
  const [subsActionLoading, setSubsActionLoading] = useState<string | null>(null)
  const [extendingSubId, setExtendingSubId] = useState<string | null>(null)
  const [extendDays, setExtendDays] = useState('30')
  const [deletingSubId, setDeletingSubId] = useState<string | null>(null)
  const [showCreateSub, setShowCreateSub] = useState(false)
  const [plans, setPlans] = useState<any[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [createSubForm, setCreateSubForm] = useState({ userId: '', planId: '', startDate: '', endDate: '' })
  const [createSubLoading, setCreateSubLoading] = useState(false)

  // Fetch admin auth
  useEffect(() => {
    fetchAdmin()
  }, [])

  // Fetch data based on active section
  useEffect(() => {
    if (admin) {
      if (activeSection === 'overview') fetchOverviewData()
      if (activeSection === 'likes-views') fetchLikesViews()
      if (activeSection === 'analytics') fetchAnalytics(timeRange)
      if (activeSection === 'revenue') fetchRevenue()
      if (activeSection === 'users') fetchUsers(1, '')
      if (activeSection === 'subscriptions') { fetchSubscriptions(1, 'all'); fetchPlansAndUsers() }
      if (activeSection === 'gallery') fetchGallery()
    }
  }, [activeSection, admin, timeRange, metricType])

  const fetchAdmin = async () => {
    try {
      const response = await fetch('/api/admin/auth/me')
      const data = await response.json()
      if (response.ok && data.success) {
        setAdmin(data.admin)
      } else {
        router.push('/admin/login')
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
      router.push('/admin/login')
    } finally {
      setLoading(false)
    }
  }

  const fetchOverviewData = async () => {
    setAnalyticsLoading(true)
    try {
      const res = await fetch('/api/admin/analytics/overview')
      const data = await res.json()
      if (data.success) setAnalytics(data.data)
    } catch (error) {
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const fetchLikesViews = async () => {
    setLvLoading(true)
    try {
      const res = await fetch('/api/admin/likes-views')
      const data = await res.json()
      if (data.success) setLvData(data.data)
    } catch {}
    finally { setLvLoading(false) }
  }

  const fetchAnalytics = async (range = timeRange) => {
    setAnalyticsDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics/time-series?timeRange=${range}`)
      const data = await res.json()
      if (data.success) setAnalyticsDetail(data.data)
    } catch (error) {
    } finally {
      setAnalyticsDetailLoading(false)
    }
  }

  const fetchRevenue = async () => {
    setRevenueLoading(true)
    try {
      const response = await fetch(`/api/admin/revenue/overview?timeRange=${timeRange}`)
      const data = await response.json()
      if (data.success) {
        setRevenueData(data.data)
      }
    } catch (error) {
    } finally {
      setRevenueLoading(false)
    }
  }

  const fetchUsers = async (page = userPage, search = userSearch) => {
    setUsersLoading(true)
    try {
      const response = await fetch(`/api/admin/users?page=${page}&limit=10&search=${search}`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
        setUserTotalPages(data.pagination.totalPages)
        setUserTotal(data.pagination.total)
      }
    } catch (error) {
    } finally {
      setUsersLoading(false)
    }
  }

  const handleEditUser = async () => {
    if (!editingUser) return
    setUserActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...data.data } : u))
        setEditingUser(null)
      }
    } catch (error) {
    } finally {
      setUserActionLoading(false)
    }
  }

  const handleToggleUserStatus = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users?id=${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !user.isActive })
      })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !user.isActive } : u))
      }
    } catch (error) {}
  }

  const handleDeleteUser = async () => {
    if (!deletingUserId) return
    setUserActionLoading(true)
    try {
      const res = await fetch(`/api/admin/users?id=${deletingUserId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setUsers(prev => prev.filter(u => u.id !== deletingUserId))
        setUserTotal(prev => prev - 1)
        setDeletingUserId(null)
      }
    } catch (error) {
    } finally {
      setUserActionLoading(false)
    }
  }

  const fetchGallery = async () => {
    setGalleryLoading(true)
    try {
      const res = await fetch('/api/admin/gallery?limit=100')
      const data = await res.json()
      if (data.success) setGalleryItems(data.data)
    } catch (error) {}
    finally { setGalleryLoading(false) }
  }

  const handleAddGallery = async () => {
    setGalleryActionLoading(true)
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm)
      })
      const data = await res.json()
      if (data.success) {
        setGalleryItems(prev => [data.data, ...prev])
        setShowAddGallery(false)
        setGalleryForm({ title: '', description: '', imageUrl: '', thumbnailUrl: '', category: '', isActive: true, contentType: 'image', isPremium: false })
      } else {
        alert('Add failed: ' + (data.error || 'Unknown error'))
      }
    } catch (error: any) { alert('Error: ' + error.message) }
    finally { setGalleryActionLoading(false) }
  }

  const handleEditGallery = async () => {
    if (!editingGallery) return
    setGalleryActionLoading(true)
    try {
      const res = await fetch(`/api/admin/gallery?id=${editingGallery.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm)
      })
      const data = await res.json()
      if (data.success) {
        setGalleryItems(prev => prev.map(g => g.id === editingGallery.id ? data.data : g))
        setEditingGallery(null)
      }
    } catch (error) {}
    finally { setGalleryActionLoading(false) }
  }

  const handleDeleteGallery = async () => {
    if (!deletingGalleryId) return
    setGalleryActionLoading(true)
    try {
      const res = await fetch(`/api/admin/gallery?id=${deletingGalleryId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setGalleryItems(prev => prev.filter(g => g.id !== deletingGalleryId))
        setDeletingGalleryId(null)
      }
    } catch (error) {}
    finally { setGalleryActionLoading(false) }
  }

  const fetchSubscriptions = async (page = 1, statusFilter = 'all') => {
    setSubsLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter)
      const response = await fetch(`/api/admin/subscriptions?${params}`)
      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.data)
        setSubsTotalPages(data.pagination.totalPages)
        setSubsTotal(data.pagination.total)
      }
    } catch (error) {
    } finally {
      setSubsLoading(false)
    }
  }

  const handleSubsAction = async (id: string, action: 'approved' | 'cancelled') => {
    setSubsActionLoading(id)
    try {
      const res = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action })
      })
      const data = await res.json()
      if (data.success) {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...data.data } : s))
      }
    } catch (error) {}
    finally { setSubsActionLoading(null) }
  }

  const handleExtendSub = async () => {
    if (!extendingSubId) return
    setSubsActionLoading(extendingSubId)
    try {
      const res = await fetch(`/api/admin/subscriptions/${extendingSubId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendDays: parseInt(extendDays) })
      })
      const data = await res.json()
      if (data.success) {
        setSubscriptions(prev => prev.map(s => s.id === extendingSubId ? { ...s, ...data.data } : s))
        setExtendingSubId(null)
        setExtendDays('30')
      }
    } catch (error) {}
    finally { setSubsActionLoading(null) }
  }

  const handleDeleteSub = async () => {
    if (!deletingSubId) return
    setSubsActionLoading(deletingSubId)
    try {
      const res = await fetch(`/api/admin/subscriptions?id=${deletingSubId}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setSubscriptions(prev => prev.filter(s => s.id !== deletingSubId))
        setSubsTotal(prev => prev - 1)
        setDeletingSubId(null)
      }
    } catch (error) {}
    finally { setSubsActionLoading(null) }
  }

  const handleCreateSub = async () => {
    if (!createSubForm.userId || !createSubForm.planId) return
    setCreateSubLoading(true)
    try {
      const body: any = { userId: createSubForm.userId, planId: createSubForm.planId, status: 'approved' }
      if (createSubForm.startDate) body.startDate = new Date(createSubForm.startDate).toISOString()
      if (createSubForm.endDate) body.endDate = new Date(createSubForm.endDate).toISOString()
      const res = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        setSubscriptions(prev => [data.data, ...prev])
        setSubsTotal(prev => prev + 1)
        setShowCreateSub(false)
        setCreateSubForm({ userId: '', planId: '', startDate: '', endDate: '' })
      }
    } catch (error) {}
    finally { setCreateSubLoading(false) }
  }

  const fetchPlansAndUsers = async () => {
    try {
      const [plansRes, usersRes] = await Promise.all([
        fetch('/api/plans'),
        fetch('/api/admin/users?page=1&limit=200&search=')
      ])
      const plansData = await plansRes.json()
      const usersData = await usersRes.json()
      if (plansData.success) setPlans(plansData.plans)
      if (usersData.success) setAllUsers(usersData.data)
    } catch (error) {}
  }

  const getUserSubStatus = (sub: any) => {
    if (sub.status !== 'approved') return sub.status
    if (sub.endDate && new Date(sub.endDate) < new Date()) return 'expired'
    return 'premium'
  }

  const handleLogout = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#ffc658', '#ff8042']

  // Render loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-panel min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Admin Panel</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'likes-views', label: 'Likes & Views', icon: Activity },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                { id: 'revenue', label: 'Revenue', icon: DollarSign },
                { id: 'gallery', label: 'Gallery', icon: Grid3x3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800 space-y-2">
            <Button variant="ghost" className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-300 hover:text-white hover:bg-gray-800"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-bold capitalize">{activeSection}</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">View Site</Button>
            </Link>
            <div className="text-sm text-muted-foreground">
              {admin?.name}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analytics?.summary ? (
                <>
                  {/* Row 1 - Users */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-blue-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{analytics.summary.totalUsers}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Active Users</CardTitle>
                        <Activity className="h-4 w-4 text-green-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">{analytics.summary.activeUsers}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Premium Subscribers</CardTitle>
                        <CreditCard className="h-4 w-4 text-purple-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-400">{analytics.summary.premiumSubscribers}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Free Users</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-gray-300">{analytics.summary.freeUsers}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Site Visits */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card className="border border-emerald-500/40 bg-emerald-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">🌐 Total Site Visits</CardTitle>
                        <TrendingUp className="h-5 w-5 text-emerald-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-emerald-400">{(analytics.summary.totalSiteVisits || 0).toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Har baar site open hone pe count hota hai</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-teal-500/40 bg-teal-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">👤 Unique Visitors</CardTitle>
                        <Users className="h-5 w-5 text-teal-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-teal-400">{(analytics.summary.uniqueSiteVisitors || 0).toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Alag alag logon ki visits</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 2 - Revenue & Content */}
                  <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-yellow-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">${analytics.summary.totalRevenue.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Monthly Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-orange-400">${analytics.summary.monthlyRevenue.toFixed(2)}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Videos</CardTitle>
                        <ImageIcon className="h-4 w-4 text-red-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-400">{analytics.summary.totalVideos}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">Total Images</CardTitle>
                        <ImageIcon className="h-4 w-4 text-cyan-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-cyan-400">{analytics.summary.totalImages}</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Likes & Views Section */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card className="border border-indigo-500/30 bg-indigo-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">👁 Total Content Views</CardTitle>
                        <BarChart3 className="h-4 w-4 text-indigo-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-indigo-400">{analytics.summary.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Across all content</p>
                        {/* Top 3 viewed categories */}
                        {analytics.contentByCategory?.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {[...analytics.contentByCategory]
                              .sort((a: any, b: any) => (b.views || b.count || 0) - (a.views || a.count || 0))
                              .slice(0, 3)
                              .map((c: any, i: number) => (
                                <div key={c.category} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {premiumCategories.find(p => p.id === c.category)?.name || c.category}</span>
                                  <span className="text-indigo-400 font-bold">{(c.views || c.count || 0).toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    <Card className="border border-rose-500/30 bg-rose-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">❤️ Total Content Likes</CardTitle>
                        <Activity className="h-4 w-4 text-rose-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-rose-400">
                          {(analytics.contentByCategory || []).reduce((sum: number, c: any) => sum + (c.likes || 0), 0).toLocaleString()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Across all content</p>
                        {/* Top 3 liked categories */}
                        {analytics.contentByCategory?.length > 0 && (
                          <div className="mt-3 space-y-1">
                            {[...analytics.contentByCategory]
                              .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
                              .slice(0, 3)
                              .map((c: any, i: number) => (
                                <div key={c.category} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-400">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} {premiumCategories.find(p => p.id === c.category)?.name || c.category}</span>
                                  <span className="text-rose-400 font-bold">{(c.likes || 0).toLocaleString()}</span>
                                </div>
                              ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Charts Row */}
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* User Growth - last 6 months */}
                    <Card>
                      <CardHeader><CardTitle className="text-base">User Growth (Last 6 Months)</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={analytics.userGrowth || []}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="month" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                            <Bar dataKey="users" fill="#8b5cf6" radius={[4,4,0,0]} name="New Users" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    {/* Subscriptions by Status */}
                    <Card>
                      <CardHeader><CardTitle className="text-base">Subscriptions by Status</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={(analytics.subsByStatus || []).filter((s: any) => s.count > 0)}
                              cx="50%" cy="50%"
                              outerRadius={90}
                              dataKey="count"
                              nameKey="status"
                              label={({ status, count }) => `${status}: ${count}`}
                              labelLine={false}
                            >
                              {(analytics.subsByStatus || []).map((_: any, i: number) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 20 Categories Chart */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">📊 20 Categories — Content Progress</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const data = analytics.contentByCategory || []
                        // Fill missing categories with 0
                        const allCats = premiumCategories.map(cat => {
                          const found = data.find((c: any) => c.category === cat.id)
                          return { id: cat.id, name: cat.name, count: found?.count || 0, views: found?.views || 0, likes: found?.likes || 0 }
                        })
                        const maxCount = Math.max(...allCats.map(c => c.count), 1)
                        const maxViews = Math.max(...allCats.map(c => c.views), 1)
                        const maxLikes = Math.max(...allCats.map(c => c.likes), 1)
                        return (
                          <div className="space-y-2">
                            <div className="flex gap-4 mb-3 text-xs">
                              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-cyan-500"></span>Content</span>
                              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-indigo-500"></span>Views</span>
                              <span className="flex items-center gap-1"><span className="inline-block w-3 h-3 rounded-sm bg-rose-500"></span>Likes</span>
                            </div>
                            {allCats.map(c => (
                              <div key={c.id} className="grid grid-cols-[120px_1fr_auto] items-center gap-2">
                                <span className="text-xs text-gray-400 truncate">{c.name}</span>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div className="h-2 rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${Math.round((c.count / maxCount) * 100)}%` }} />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div className="h-2 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.round((c.views / maxViews) * 100)}%` }} />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                                      <div className="h-2 rounded-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.round((c.likes / maxLikes) * 100)}%` }} />
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right text-xs space-y-1 w-12">
                                  <div className="text-cyan-400 font-bold">{c.count}</div>
                                  <div className="text-indigo-400">{c.views}</div>
                                  <div className="text-rose-400">{c.likes}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No data available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Likes & Views Section */}
          {activeSection === 'likes-views' && (
            <div className="space-y-6">
              {lvLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : lvData ? (
                <>
                  {/* Total KPI Cards */}
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <Card className="border border-indigo-500/40 bg-indigo-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">👁 Total Views</CardTitle>
                        <BarChart3 className="h-5 w-5 text-indigo-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-indigo-400">{lvData.totalViews.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Real views from database</p>
                      </CardContent>
                    </Card>
                    <Card className="border border-rose-500/40 bg-rose-500/5">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-400">❤️ Total Likes</CardTitle>
                        <Activity className="h-5 w-5 text-rose-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-4xl font-bold text-rose-400">{lvData.totalLikes.toLocaleString()}</div>
                        <p className="text-xs text-gray-500 mt-1">Real likes from database</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* 20 Categories Progress Chart */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">📊 20 Categories — Views & Likes Progress</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const maxViews = Math.max(...lvData.byCategory.map((c: any) => c.views), 1)
                        const maxLikes = Math.max(...lvData.byCategory.map((c: any) => c.likes), 1)
                        return (
                          <div className="space-y-3">
                            <div className="flex gap-5 mb-3 text-xs">
                              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-indigo-500" />Views</span>
                              <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-rose-500" />Likes</span>
                            </div>
                            {lvData.byCategory.map((c: any) => {
                              const name = premiumCategories.find((p: any) => p.id === c.category)?.name || c.category
                              return (
                                <div key={c.category} className="grid grid-cols-[110px_1fr_80px] items-center gap-2">
                                  <span className="text-xs text-gray-400 truncate">{name}</span>
                                  <div className="space-y-1">
                                    <div className="bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                      <div className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${Math.round((c.views / maxViews) * 100)}%` }} />
                                    </div>
                                    <div className="bg-gray-800 rounded-full h-2.5 overflow-hidden">
                                      <div className="h-2.5 rounded-full bg-rose-500 transition-all duration-500" style={{ width: `${Math.round((c.likes / maxLikes) * 100)}%` }} />
                                    </div>
                                  </div>
                                  <div className="text-right text-xs space-y-1">
                                    <div className="text-indigo-400 font-bold">{c.views.toLocaleString()}</div>
                                    <div className="text-rose-400 font-bold">{c.likes.toLocaleString()}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* Views Bar Chart */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">👁 Views per Category</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={lvData.byCategory.map((c: any) => ({ name: premiumCategories.find((p: any) => p.id === c.category)?.name || c.category, views: c.views }))} margin={{ bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: any) => [v.toLocaleString(), '👁 Views']} />
                          <Bar dataKey="views" fill="#6366f1" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Likes Bar Chart */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">❤️ Likes per Category</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={lvData.byCategory.map((c: any) => ({ name: premiumCategories.find((p: any) => p.id === c.category)?.name || c.category, likes: c.likes }))} margin={{ bottom: 60 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: any) => [v.toLocaleString(), '❤️ Likes']} />
                          <Bar dataKey="likes" fill="#f43f5e" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Top 10 Most Viewed */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">🔥 Top 10 Most Viewed Content</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">👁 Views</TableHead>
                            <TableHead className="text-right">❤️ Likes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lvData.topViewed.map((item: any, i: number) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-gray-400 font-bold">{i + 1}</TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell className="text-gray-400">{premiumCategories.find(p => p.id === item.category)?.name || item.category || '—'}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs border-gray-600">{item.contentType}</Badge></TableCell>
                              <TableCell className="text-right font-bold text-indigo-400">{item.views.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-bold text-rose-400">{item.likes.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Top 10 Most Liked */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">❤️ Top 10 Most Liked Content</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">❤️ Likes</TableHead>
                            <TableHead className="text-right">👁 Views</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lvData.topLiked.map((item: any, i: number) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-gray-400 font-bold">{i + 1}</TableCell>
                              <TableCell className="font-medium">{item.title}</TableCell>
                              <TableCell className="text-gray-400">{premiumCategories.find(p => p.id === item.category)?.name || item.category || '—'}</TableCell>
                              <TableCell><Badge variant="outline" className="text-xs border-gray-600">{item.contentType}</Badge></TableCell>
                              <TableCell className="text-right font-bold text-rose-400">{item.likes.toLocaleString()}</TableCell>
                              <TableCell className="text-right font-bold text-indigo-400">{item.views.toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card><CardContent className="py-12 text-center"><p className="text-muted-foreground">No data available</p></CardContent></Card>
              )}
            </div>
          )}

          {/* Analytics Section */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              {/* Time Filter */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex gap-2 flex-wrap">
                    {['hourly','daily','weekly','monthly','yearly'].map(r => (
                      <Button key={r} size="sm"
                        variant={timeRange === r ? 'default' : 'outline'}
                        className={timeRange === r ? 'bg-primary' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
                        onClick={() => { setTimeRange(r); fetchAnalytics(r) }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {analyticsDetailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : analyticsDetail ? (
                <>
                  {/* Row 1 - User Growth + Subscriptions/Revenue */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader><CardTitle className="text-base">New Users Growth</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <AreaChart data={analyticsDetail.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="period" stroke="#9ca3af" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis stroke="#9ca3af" allowDecimals={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                            <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} name="New Users" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-base">Traffic Trends (Subscriptions & Revenue)</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={260}>
                          <LineChart data={analyticsDetail.userGrowth}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="period" stroke="#9ca3af" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis yAxisId="left" stroke="#9ca3af" allowDecimals={false} />
                            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                            <Legend />
                            <Line yAxisId="left" type="monotone" dataKey="subscriptions" stroke="#06b6d4" name="Subscriptions" dot={false} />
                            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" name="Revenue ($)" dot={false} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 2 - Gender + Age */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader><CardTitle className="text-base">Gender Distribution</CardTitle></CardHeader>
                      <CardContent>
                        {analyticsDetail.genderDistribution?.length > 0 ? (
                          <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                              <Pie data={analyticsDetail.genderDistribution} cx="50%" cy="50%"
                                outerRadius={90} dataKey="count" nameKey="gender"
                                label={({ gender, percent }) => `${gender} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                              >
                                {analyticsDetail.genderDistribution.map((_: any, i: number) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : <p className="text-center py-10 text-gray-500 text-sm">No gender data</p>}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader><CardTitle className="text-base">Age Distribution</CardTitle></CardHeader>
                      <CardContent>
                        {analyticsDetail.ageDistribution?.length > 0 ? (
                          <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={analyticsDetail.ageDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="age" stroke="#9ca3af" />
                              <YAxis stroke="#9ca3af" allowDecimals={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} />
                              <Bar dataKey="count" name="Users" radius={[4,4,0,0]}>
                                {analyticsDetail.ageDistribution.map((_: any, i: number) => (
                                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        ) : <p className="text-center py-10 text-gray-500 text-sm">No age data</p>}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Row 3 - Category Views & Likes Chart + Prediction */}
                  {analyticsDetail.categoryPopularity?.length > 0 && (() => {
                    const catData = analyticsDetail.categoryPopularity
                    const catNames: Record<string, string> = {
                      solo: 'Solo', roleplay: 'Roleplay', bathroom: 'Bathroom', bedroom: 'Bedroom',
                      lingerie: 'Lingerie', outdoor: 'Outdoor', intimate: 'Intimate', dance: 'Dance',
                      cosplay: 'Cosplay', bts: 'BTS', shower: 'Shower', mirror: 'Mirror Selfie',
                      fitness: 'Fitness', pool: 'Pool/Beach', nightout: 'Night Out', morning: 'Morning',
                      cooking: 'Cooking', office: 'Office', travel: 'Travel', special: 'Special'
                    }
                    const chartData = catData.map((c: any) => ({
                      name: catNames[c.name] || c.name,
                      id: c.name,
                      views: c.totalViews,
                      likes: c.totalLikes,
                      count: c.contentCount,
                      engagement: c.contentCount > 0 ? Math.round(((c.totalViews + c.totalLikes * 2) / c.contentCount) * 10) / 10 : 0
                    }))

                    // Top 3 by views
                    const top3Views = [...chartData].sort((a: any, b: any) => b.views - a.views).slice(0, 3)
                    // Top 3 by likes
                    const top3Likes = [...chartData].sort((a: any, b: any) => b.likes - a.likes).slice(0, 3)
                    // Top 3 by engagement score
                    const top3Eng = [...chartData].sort((a: any, b: any) => b.engagement - a.engagement).slice(0, 3)
                    // Low content but high engagement = upload more here
                    const uploadSuggestions = [...chartData]
                      .filter((c: any) => c.engagement > 0)
                      .sort((a: any, b: any) => (b.engagement / Math.max(b.count, 1)) - (a.engagement / Math.max(a.count, 1)))
                      .slice(0, 3)

                    return (
                      <>
                        {/* Category Views + Likes Bar Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">📊 Category Performance — Views & Likes</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={320}>
                              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" interval={0} />
                                <YAxis stroke="#9ca3af" />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                                  formatter={(val: any, name: string) => [val.toLocaleString(), name === 'views' ? '👁 Views' : '❤️ Likes']}
                                />
                                <Legend formatter={(val) => val === 'views' ? '👁 Views' : '❤️ Likes'} />
                                <Bar dataKey="views" fill="#06b6d4" name="views" radius={[3,3,0,0]} />
                                <Bar dataKey="likes" fill="#f43f5e" name="likes" radius={[3,3,0,0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Engagement Score Chart */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-base">🔥 Engagement Score per Category <span className="text-xs text-gray-400 font-normal ml-2">(Views + Likes×2) ÷ Content Count</span></CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={280}>
                              <BarChart data={[...chartData].sort((a: any, b: any) => b.engagement - a.engagement)} layout="vertical" margin={{ left: 10, right: 30 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis type="number" stroke="#9ca3af" />
                                <YAxis type="category" dataKey="name" stroke="#9ca3af" width={85} tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: any) => [v, 'Engagement Score']} />
                                <Bar dataKey="engagement" radius={[0,4,4,0]}>
                                  {[...chartData].sort((a: any, b: any) => b.engagement - a.engagement).map((_: any, i: number) => (
                                    <Cell key={i} fill={i === 0 ? '#f59e0b' : i === 1 ? '#8b5cf6' : i === 2 ? '#06b6d4' : '#374151'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* AI Prediction & Upload Suggestions */}
                        <Card className="border border-amber-500/30 bg-amber-500/5">
                          <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                              <span>🤖</span> AI Content Prediction & Upload Suggestions
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-5">
                            {/* Top by Views */}
                            <div>
                              <p className="text-sm font-semibold text-cyan-400 mb-2">👁 Most Viewed Categories — Upload More Here</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {top3Views.map((c: any, i: number) => (
                                  <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-cyan-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                      <span className="font-semibold text-white text-sm">{c.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{c.views.toLocaleString()} views • {c.count} items</p>
                                    <p className="text-xs text-cyan-400 mt-1">✅ Upload more {c.name} content</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Top by Likes */}
                            <div>
                              <p className="text-sm font-semibold text-rose-400 mb-2">❤️ Most Liked Categories — Audience Loves These</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {top3Likes.map((c: any, i: number) => (
                                  <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-rose-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                      <span className="font-semibold text-white text-sm">{c.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">{c.likes.toLocaleString()} likes • {c.count} items</p>
                                    <p className="text-xs text-rose-400 mt-1">💡 High demand — prioritize this</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Upload Suggestions based on engagement per item */}
                            <div>
                              <p className="text-sm font-semibold text-amber-400 mb-2">⚡ Best ROI — High Engagement, Upload More to Grow</p>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {uploadSuggestions.map((c: any, i: number) => (
                                  <div key={c.id} className="bg-gray-800 rounded-lg p-3 border border-amber-500/20">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-lg">🎯</span>
                                      <span className="font-semibold text-white text-sm">{c.name}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">Score: {c.engagement} • {c.count} items</p>
                                    <p className="text-xs text-amber-400 mt-1">📈 Next upload: {c.name} content</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Summary Tip */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                              <p className="text-sm text-gray-300">
                                <span className="text-amber-400 font-semibold">📌 Summary: </span>
                                Next upload ke liye focus karo{' '}
                                <span className="text-cyan-400 font-bold">{top3Views[0]?.name}</span>,{' '}
                                <span className="text-rose-400 font-bold">{top3Likes[0]?.name}</span> aur{' '}
                                <span className="text-amber-400 font-bold">{uploadSuggestions[0]?.name}</span> categories pe —
                                in mein audience engagement sabse zyada hai.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </>
                    )
                  })()}

                  {/* Row 4 - Most Viewed Content */}
                  {analyticsDetail.mostViewed?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-base">Most Viewed Content</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>#</TableHead>
                              <TableHead>Title</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Views</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {analyticsDetail.mostViewed.map((c: any, i: number) => (
                              <TableRow key={c.id}>
                                <TableCell className="text-gray-400">{i + 1}</TableCell>
                                <TableCell className="font-medium">{c.title}</TableCell>
                                <TableCell><Badge variant="outline" className="text-xs border-gray-600">{c.type}</Badge></TableCell>
                                <TableCell className="text-gray-400">{c.category}</TableCell>
                                <TableCell className="text-right font-bold text-indigo-400">{c.views.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Activity Heatmap */}
                  <Card>
                    <CardHeader><CardTitle className="text-base">Activity Heatmap (User Signups — Last 30 Days)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <div className="flex gap-1 mb-1 ml-10">
                          {Array.from({ length: 24 }).map((_, h) => (
                            <div key={h} className="w-5 text-center text-xs text-gray-500" style={{ minWidth: 20 }}>{h % 6 === 0 ? h : ''}</div>
                          ))}
                        </div>
                        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, d) => {
                          const maxVal = Math.max(...(analyticsDetail.heatmap || []).map((h: any) => h.value), 1)
                          return (
                            <div key={d} className="flex items-center gap-1 mb-1">
                              <span className="text-xs text-gray-500 w-8 text-right mr-1">{day}</span>
                              {Array.from({ length: 24 }).map((_, h) => {
                                const cell = (analyticsDetail.heatmap || []).find((x: any) => x.day === d && x.hour === h)
                                const val = cell?.value || 0
                                const intensity = maxVal > 0 ? val / maxVal : 0
                                const bg = intensity === 0 ? '#1f2937'
                                  : intensity < 0.25 ? '#312e81'
                                  : intensity < 0.5 ? '#4c1d95'
                                  : intensity < 0.75 ? '#6d28d9'
                                  : '#8b5cf6'
                                return (
                                  <div key={h} title={`${day} ${h}:00 — ${val} signups`}
                                    style={{ width: 20, height: 20, minWidth: 20, backgroundColor: bg, borderRadius: 3 }}
                                  />
                                )
                              })}
                            </div>
                          )
                        })}
                        <div className="flex items-center gap-2 mt-3 ml-10">
                          <span className="text-xs text-gray-500">Less</span>
                          {['#1f2937','#312e81','#4c1d95','#6d28d9','#8b5cf6'].map((c, i) => (
                            <div key={i} style={{ width: 16, height: 16, backgroundColor: c, borderRadius: 3 }} />
                          ))}
                          <span className="text-xs text-gray-500">More</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No analytics data</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Revenue Section */}
          {activeSection === 'revenue' && (
            <div className="space-y-6">
              {/* Time Range Filter */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex gap-2 flex-wrap">
                    {['daily','weekly','monthly','yearly'].map(r => (
                      <Button key={r} size="sm"
                        variant={timeRange === r ? 'default' : 'outline'}
                        className={timeRange === r ? 'bg-primary' : 'border-gray-700 text-gray-300 hover:bg-gray-800'}
                        onClick={() => { setTimeRange(r); fetchRevenue() }}
                      >
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {revenueLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : revenueData ? (() => {
                const totalRev = parseFloat(revenueData.totalRevenue || '0')
                const mrr = parseFloat(revenueData.mrr || '0')
                const totalSubs = revenueData.metrics?.totalSubscribers || 0
                const arpu = revenueData.metrics?.averageRevenuePerUser || 0
                const refundCount = Number(revenueData.refunds?.count || 0)
                const refundAmount = parseFloat(revenueData.refunds?.totalAmount || '0')

                // Next month estimate: based on MRR + avg growth from trend
                const trend = revenueData.revenueTrend || []
                let nextMonthEstimate = mrr
                if (trend.length >= 2) {
                  const last = parseFloat(trend[trend.length - 1]?.revenue || '0')
                  const prev = parseFloat(trend[trend.length - 2]?.revenue || '0')
                  const growth = prev > 0 ? (last - prev) / prev : 0
                  nextMonthEstimate = mrr * (1 + growth)
                }

                return (
                  <>
                    {/* KPI Cards Row 1 */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Total Revenue</CardTitle>
                          <DollarSign className="h-4 w-4 text-yellow-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-yellow-400">${totalRev.toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">All time</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">MRR (Active)</CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-400">${mrr.toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">Monthly recurring</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Next Month Est.</CardTitle>
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-400">${nextMonthEstimate.toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">Based on growth trend</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">ARPU</CardTitle>
                          <Activity className="h-4 w-4 text-purple-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-purple-400">${parseFloat(arpu.toString()).toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">Avg per user</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* KPI Cards Row 2 */}
                    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Active Subscribers</CardTitle>
                          <Users className="h-4 w-4 text-cyan-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-cyan-400">{totalSubs}</div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Cancelled / Expired</CardTitle>
                          <XCircle className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-red-400">{refundCount}</div>
                          <p className="text-xs text-gray-500 mt-1">In selected period</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Lost Revenue</CardTitle>
                          <XCircle className="h-4 w-4 text-orange-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-orange-400">${refundAmount.toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">Cancelled subs</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-400">Net Revenue</CardTitle>
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-emerald-400">${(totalRev - refundAmount).toFixed(2)}</div>
                          <p className="text-xs text-gray-500 mt-1">Total - Lost</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Revenue Growth Chart */}
                    <Card>
                      <CardHeader><CardTitle className="text-base">Revenue Growth ({timeRange})</CardTitle></CardHeader>
                      <CardContent>
                        {trend.length > 0 ? (
                          <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={trend.map((t: any) => ({ period: t.period, revenue: parseFloat(t.revenue || '0') }))}>
                              <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis dataKey="period" stroke="#9ca3af" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                              <YAxis stroke="#9ca3af" tickFormatter={(v) => `$${v}`} />
                              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: any) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']} />
                              <Area type="monotone" dataKey="revenue" stroke="#f59e0b" fill="url(#revGrad)" strokeWidth={2} />
                            </AreaChart>
                          </ResponsiveContainer>
                        ) : <p className="text-center py-10 text-gray-500 text-sm">No trend data for this period</p>}
                      </CardContent>
                    </Card>

                    {/* Revenue by Plan Chart + Table */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <Card>
                        <CardHeader><CardTitle className="text-base">Revenue by Plan</CardTitle></CardHeader>
                        <CardContent>
                          {revenueData.revenueByPlan.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                              <PieChart>
                                <Pie
                                  data={revenueData.revenueByPlan.map((p: any) => ({ name: p.planName, value: parseFloat(p.revenue || '0') }))}
                                  cx="50%" cy="50%" outerRadius={90}
                                  dataKey="value" nameKey="name"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                  labelLine={false}
                                >
                                  {revenueData.revenueByPlan.map((_: any, i: number) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }} formatter={(v: any) => [`$${parseFloat(v).toFixed(2)}`, 'Revenue']} />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : <p className="text-center py-10 text-gray-500 text-sm">No plan data</p>}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader><CardTitle className="text-base">Plan Breakdown</CardTitle></CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Plan</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Subs</TableHead>
                                <TableHead>Revenue</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {revenueData.revenueByPlan.map((plan: any, i: number) => (
                                <TableRow key={i}>
                                  <TableCell className="font-medium">{plan.planName}</TableCell>
                                  <TableCell>${parseFloat(plan.price || '0').toFixed(2)}</TableCell>
                                  <TableCell>{plan.subscribers}</TableCell>
                                  <TableCell className="text-yellow-400 font-bold">${parseFloat(plan.revenue || '0').toFixed(2)}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Transaction History */}
                    <Card>
                      <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Plan</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Date</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {revenueData.recentTransactions.length === 0 ? (
                              <TableRow><TableCell colSpan={5} className="text-center text-gray-500 py-8">No transactions found</TableCell></TableRow>
                            ) : revenueData.recentTransactions.map((txn: any, i: number) => {
                              const isPaid = txn.status === 'approved'
                              const isCancelled = txn.status === 'cancelled'
                              const isExpired = txn.status === 'expired'
                              return (
                                <TableRow key={txn.id || i}>
                                  <TableCell>
                                    <p className="font-medium">{txn.userName || 'N/A'}</p>
                                    <p className="text-xs text-gray-500">{txn.userEmail}</p>
                                  </TableCell>
                                  <TableCell>{txn.planName}</TableCell>
                                  <TableCell className="font-bold">
                                    <span className={isPaid ? 'text-green-400' : 'text-gray-400'}>
                                      ${parseFloat(txn.revenue || '0').toFixed(2)}
                                    </span>
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-400">
                                    {txn.date ? new Date(txn.date).toLocaleDateString() : '—'}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={
                                      isPaid ? 'bg-green-600/20 text-green-400 border border-green-600/30' :
                                      isCancelled ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                                      isExpired ? 'bg-orange-600/20 text-orange-400 border border-orange-600/30' :
                                      'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                                    }>
                                      {isPaid ? '✓ Paid' : isCancelled ? '✗ Cancelled' : isExpired ? '⏱ Expired' : txn.status}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </>
                )
              })() : (
                <Card><CardContent className="py-12 text-center"><p className="text-gray-500">No revenue data available</p></CardContent></Card>
              )}
            </div>
          )}

          {/* Gallery Section */}
          {activeSection === 'gallery' && (
            <div className="space-y-6">
              {/* Add Gallery Dialog */}
              <Dialog open={showAddGallery} onOpenChange={setShowAddGallery}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
                  <DialogHeader><DialogTitle>Add Content</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    {/* Step 1: Access & Content Type FIRST */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Access *</Label>
                        <Select value={galleryForm.isPremium ? 'true' : 'false'} onValueChange={val => setGalleryForm(p => ({ ...p, isPremium: val === 'true', category: '', contentType: val === 'true' ? p.contentType : 'image' }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">🆓 Free</SelectItem>
                            <SelectItem value="true">👑 Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Content Type *</Label>
                        <Select value={galleryForm.contentType} onValueChange={val => setGalleryForm(p => ({ ...p, contentType: val }))} disabled={!galleryForm.isPremium}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">🖼️ Image</SelectItem>
                            {galleryForm.isPremium && <SelectItem value="video">🎬 Video</SelectItem>}
                          </SelectContent>
                        </Select>
                        {!galleryForm.isPremium && <p className="text-xs text-gray-500">Free content: only images allowed</p>}
                      </div>
                    </div>
                    {galleryForm.isPremium && (
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select value={galleryForm.category} onValueChange={val => setGalleryForm(p => ({ ...p, category: val }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select premium category" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {premiumCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Title *</Label>
                      <Input value={galleryForm.title} onChange={e => setGalleryForm(p => ({ ...p, title: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="Content title" />
                    </div>
                    <div className="space-y-1">
                      <Label>{galleryForm.contentType === 'video' ? 'Video Upload / URL' : 'Image Upload / URL'}</Label>
                      <div className="flex gap-2">
                        <Input value={galleryForm.imageUrl} onChange={e => setGalleryForm(p => ({ ...p, imageUrl: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder={galleryForm.contentType === 'video' ? 'https://... or upload from device' : '/images/... or https://...'} />
                        <label className="cursor-pointer">
                          <input type="file" accept={galleryForm.contentType === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={galleryForm.contentType === 'video' ? handleVideoUpload : handleImageUpload} />
                          <div className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white whitespace-nowrap">
                            {(galleryForm.contentType === 'video' ? uploadingVideo : uploadingImage) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Upload
                          </div>
                        </label>
                      </div>
                      {galleryForm.imageUrl && galleryForm.contentType !== 'video' && (
                        <img src={galleryForm.imageUrl} className="mt-2 h-20 w-20 object-cover rounded border border-gray-700" onError={(e:any) => e.target.style.display='none'} />
                      )}
                    </div>
                    {galleryForm.contentType === 'video' && (
                      <div className="space-y-1">
                        <Label>Thumbnail</Label>
                        <div className="flex gap-2">
                          <Input value={galleryForm.thumbnailUrl} onChange={e => setGalleryForm(p => ({ ...p, thumbnailUrl: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="https://... or upload" />
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
                            <div className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white whitespace-nowrap">
                              {uploadingThumb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              Upload
                            </div>
                          </label>
                        </div>
                        {galleryForm.thumbnailUrl && (
                          <img src={galleryForm.thumbnailUrl} className="mt-2 h-20 w-20 object-cover rounded border border-gray-700" onError={(e:any) => e.target.style.display='none'} />
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select value={galleryForm.isActive ? 'true' : 'false'} onValueChange={val => setGalleryForm(p => ({ ...p, isActive: val === 'true' }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddGallery(false)} className="border-gray-700 text-white">Cancel</Button>
                    <Button onClick={handleAddGallery} disabled={galleryActionLoading || uploadingImage || uploadingVideo}>
                      {galleryActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Content'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Edit Gallery Dialog */}
              <Dialog open={!!editingGallery} onOpenChange={open => !open && setEditingGallery(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg">
                  <DialogHeader><DialogTitle>Edit Gallery Image</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input value={galleryForm.title} onChange={e => setGalleryForm(p => ({ ...p, title: e.target.value }))} className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="space-y-1">
                      <Label>{galleryForm.contentType === 'video' ? 'Video Upload ya URL' : 'Image Upload ya URL'}</Label>
                      <div className="flex gap-2">
                        <Input value={galleryForm.imageUrl} onChange={e => setGalleryForm(p => ({ ...p, imageUrl: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder={galleryForm.contentType === 'video' ? 'https://... ya upload karo' : ''} />
                        <label className="cursor-pointer">
                          <input type="file" accept={galleryForm.contentType === 'video' ? 'video/*' : 'image/*'} className="hidden" onChange={galleryForm.contentType === 'video' ? handleVideoUpload : handleImageUpload} />
                          <div className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white whitespace-nowrap">
                            {(galleryForm.contentType === 'video' ? uploadingVideo : uploadingImage) ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Upload
                          </div>
                        </label>
                      </div>
                      {galleryForm.imageUrl && galleryForm.contentType !== 'video' && (
                        <img src={galleryForm.imageUrl} className="mt-2 h-20 w-20 object-cover rounded border border-gray-700" onError={(e:any) => e.target.style.display='none'} />
                      )}
                    </div>
                    {galleryForm.contentType === 'video' && (
                      <div className="space-y-1">
                        <Label>Thumbnail (Image)</Label>
                        <div className="flex gap-2">
                          <Input value={galleryForm.thumbnailUrl} onChange={e => setGalleryForm(p => ({ ...p, thumbnailUrl: e.target.value }))} className="bg-gray-800 border-gray-700" placeholder="https://... ya upload karo" />
                          <label className="cursor-pointer">
                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbUpload} />
                            <div className="flex items-center gap-1 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-sm text-white whitespace-nowrap">
                              {uploadingThumb ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              Upload
                            </div>
                          </label>
                        </div>
                        {galleryForm.thumbnailUrl && (
                          <img src={galleryForm.thumbnailUrl} className="mt-2 h-20 w-20 object-cover rounded border border-gray-700" onError={(e:any) => e.target.style.display='none'} />
                        )}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Content Type</Label>
                        <Select value={galleryForm.contentType} onValueChange={val => setGalleryForm(p => ({ ...p, contentType: val }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label>Access</Label>
                        <Select value={galleryForm.isPremium ? 'true' : 'false'} onValueChange={val => setGalleryForm(p => ({ ...p, isPremium: val === 'true', category: '' }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">Free</SelectItem>
                            <SelectItem value="true">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {galleryForm.isPremium && (
                      <div className="space-y-1">
                        <Label>Category</Label>
                        <Select value={galleryForm.category} onValueChange={val => setGalleryForm(p => ({ ...p, category: val }))}>
                          <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select category" /></SelectTrigger>
                          <SelectContent className="max-h-60">
                            {premiumCategories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <Select value={galleryForm.isActive ? 'true' : 'false'} onValueChange={val => setGalleryForm(p => ({ ...p, isActive: val === 'true' }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingGallery(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button onClick={handleEditGallery} disabled={galleryActionLoading || uploadingImage}>
                      {galleryActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Gallery Dialog */}
              <Dialog open={!!deletingGalleryId} onOpenChange={open => !open && setDeletingGalleryId(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete Image</DialogTitle>
                    <DialogDescription className="text-gray-400">Are you sure? This will permanently delete this gallery image.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeletingGalleryId(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteGallery} disabled={galleryActionLoading}>
                      {galleryActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Gallery Management <span className="text-sm font-normal text-gray-400 ml-2">({galleryItems.length} images)</span></CardTitle>
                    <Button onClick={() => { setGalleryForm({ title: '', description: '', imageUrl: '', thumbnailUrl: '', category: '', isActive: true, contentType: 'image', isPremium: false }); setShowAddGallery(true) }} className="bg-primary hover:bg-primary/90">
                      <Plus className="h-4 w-4 mr-2" /> Add content
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {galleryLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : galleryItems.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {galleryItems.map((item) => (
                        <div key={item.id} className="relative group rounded-lg overflow-hidden border border-gray-700 bg-gray-800">
                          <div className="aspect-square relative">
                            <img
                              src={item.contentType === 'video' ? (item.thumbnailUrl || `https://placehold.co/200x200/1f2937/6b7280?text=Video`) : item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e: any) => { e.target.src = 'https://placehold.co/200x200/1f2937/6b7280?text=No+Image' }}
                            />
                            {!item.isActive && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Badge variant="secondary">Inactive</Badge>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-sm font-medium truncate">{item.title}</p>
                            <div className="flex gap-1 mt-1">
                              <Badge variant="outline" className="text-xs px-1 py-0">{item.contentType || 'image'}</Badge>
                              <Badge variant={item.isPremium ? 'default' : 'secondary'} className="text-xs px-1 py-0">{item.isPremium ? 'Premium' : 'Free'}</Badge>
                            </div>
                          </div>
                          <div className="absolute top-2 right-2 hidden group-hover:flex gap-1">
                            <Button
                              size="sm" variant="secondary"
                              className="h-7 w-7 p-0 bg-gray-900/90"
                              onClick={() => {
                                setEditingGallery(item)
                                setGalleryForm({ title: item.title, description: item.description || '', imageUrl: item.imageUrl, thumbnailUrl: item.thumbnailUrl || '', category: item.category || '', isActive: item.isActive, contentType: item.contentType || 'image', isPremium: item.isPremium || false })
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm" variant="destructive"
                              className="h-7 w-7 p-0"
                              onClick={() => setDeletingGalleryId(item.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-12 text-muted-foreground">No gallery images found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-6">
              {/* Edit User Dialog */}
              <Dialog open={!!editingUser} onOpenChange={open => !open && setEditingUser(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription className="text-gray-400">Update user name and email.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-1">
                      <Label>Name</Label>
                      <Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} className="bg-gray-800 border-gray-700" />
                    </div>
                    <div className="space-y-1">
                      <Label>Email</Label>
                      <Input value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} className="bg-gray-800 border-gray-700" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setEditingUser(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button onClick={handleEditUser} disabled={userActionLoading}>
                      {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Confirm Dialog */}
              <Dialog open={!!deletingUserId} onOpenChange={open => !open && setDeletingUserId(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription className="text-gray-400">Are you sure? This will permanently delete the user and all their data.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeletingUserId(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteUser} disabled={userActionLoading}>
                      {userActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Users Management <span className="text-sm font-normal text-gray-400 ml-2">({userTotal} total)</span></CardTitle>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Search name or email..."
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && fetchUsers(1, userSearch)}
                        className="w-56 bg-gray-800 border-gray-700"
                      />
                      <Button onClick={() => { setUserPage(1); fetchUsers(1, userSearch) }} variant="outline" className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : users.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge variant={user.isActive ? 'default' : 'secondary'}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-700 text-white hover:bg-gray-700 h-8 px-2"
                                    onClick={() => { setEditingUser(user); setEditForm({ name: user.name || '', email: user.email }) }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className={`border-gray-700 h-8 px-2 ${ user.isActive ? 'text-yellow-400 hover:bg-yellow-400/10' : 'text-green-400 hover:bg-green-400/10' }`}
                                    onClick={() => handleToggleUserStatus(user)}
                                  >
                                    {user.isActive ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-gray-700 text-red-400 hover:bg-red-400/10 h-8 px-2"
                                    onClick={() => setDeletingUserId(user.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      {/* Pagination */}
                      {userTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-400">Page {userPage} of {userTotalPages}</p>
                          <div className="flex gap-2">
                            <Button
                              size="sm" variant="outline"
                              className="border-gray-700 text-white"
                              disabled={userPage === 1}
                              onClick={() => { const p = userPage - 1; setUserPage(p); fetchUsers(p, userSearch) }}
                            >Previous</Button>
                            <Button
                              size="sm" variant="outline"
                              className="border-gray-700 text-white"
                              disabled={userPage === userTotalPages}
                              onClick={() => { const p = userPage + 1; setUserPage(p); fetchUsers(p, userSearch) }}
                            >Next</Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center py-12 text-muted-foreground">No users found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Subscriptions Section */}
          {activeSection === 'subscriptions' && (
            <div className="space-y-6">
              {/* Create Dialog */}
              <Dialog open={showCreateSub} onOpenChange={open => { setShowCreateSub(open); if (!open) setCreateSubForm({ userId: '', planId: '', startDate: '', endDate: '' }) }}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Create Subscription</DialogTitle>
                    <DialogDescription className="text-gray-400">Manually create a subscription for a user.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 py-2">
                    <div className="space-y-1">
                      <Label>User *</Label>
                      <Select value={createSubForm.userId} onValueChange={val => setCreateSubForm(p => ({ ...p, userId: val }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select user" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {allUsers.map((u: any) => (
                            <SelectItem key={u.id} value={u.id}>{u.name || u.email} {u.name ? `(${u.email})` : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Plan *</Label>
                      <Select value={createSubForm.planId} onValueChange={val => setCreateSubForm(p => ({ ...p, planId: val }))}>
                        <SelectTrigger className="bg-gray-800 border-gray-700"><SelectValue placeholder="Select plan" /></SelectTrigger>
                        <SelectContent>
                          {plans.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name} — ${p.price}/{p.duration}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Start Date</Label>
                        <Input type="date" value={createSubForm.startDate} onChange={e => setCreateSubForm(p => ({ ...p, startDate: e.target.value }))} className="bg-gray-800 border-gray-700" />
                      </div>
                      <div className="space-y-1">
                        <Label>End Date</Label>
                        <Input type="date" value={createSubForm.endDate} onChange={e => setCreateSubForm(p => ({ ...p, endDate: e.target.value }))} className="bg-gray-800 border-gray-700" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">If end date is empty, it will be auto-calculated from plan duration.</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowCreateSub(false)} className="border-gray-700 text-white">Cancel</Button>
                    <Button onClick={handleCreateSub} disabled={createSubLoading || !createSubForm.userId || !createSubForm.planId}>
                      {createSubLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Extend Dialog */}
              <Dialog open={!!extendingSubId} onOpenChange={open => !open && setExtendingSubId(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Extend Subscription</DialogTitle>
                    <DialogDescription className="text-gray-400">Enter number of days to extend.</DialogDescription>
                  </DialogHeader>
                  <div className="py-2">
                    <Label>Days to Extend</Label>
                    <Input type="number" min="1" value={extendDays} onChange={e => setExtendDays(e.target.value)} className="bg-gray-800 border-gray-700 mt-1" />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setExtendingSubId(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button onClick={handleExtendSub} disabled={!!subsActionLoading}>
                      {subsActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Extend'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Delete Dialog */}
              <Dialog open={!!deletingSubId} onOpenChange={open => !open && setDeletingSubId(null)}>
                <DialogContent className="bg-gray-900 border-gray-700 text-white">
                  <DialogHeader>
                    <DialogTitle>Delete Subscription</DialogTitle>
                    <DialogDescription className="text-gray-400">Are you sure? This will permanently delete this subscription.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeletingSubId(null)} className="border-gray-700 text-white">Cancel</Button>
                    <Button variant="destructive" onClick={handleDeleteSub} disabled={!!subsActionLoading}>
                      {subsActionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle>Subscriptions <span className="text-sm font-normal text-gray-400 ml-2">({subsTotal} total)</span></CardTitle>
                    <div className="flex gap-2">
                      <Select value={subsStatusFilter} onValueChange={val => { setSubsStatusFilter(val); setSubsPage(1); fetchSubscriptions(1, val) }}>
                        <SelectTrigger className="w-36 bg-gray-800 border-gray-700"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => setShowCreateSub(true)} className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {subsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : subscriptions.length > 0 ? (
                    <>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start</TableHead>
                            <TableHead>Expiry</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map((sub: any) => {
                            const userStatus = getUserSubStatus(sub)
                            const isExpired = userStatus === 'expired'
                            const isActive = sub.status === 'approved' && !isExpired
                            return (
                              <TableRow key={sub.id}>
                                <TableCell>
                                  <p className="font-medium">{sub.user?.name || 'N/A'}</p>
                                  <p className="text-xs text-muted-foreground">{sub.user?.email}</p>
                                </TableCell>
                                <TableCell>{sub.plan?.name}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    userStatus === 'premium' ? 'bg-purple-600 text-white' :
                                    isExpired ? 'bg-red-600/20 text-red-400 border border-red-600/30' :
                                    userStatus === 'pending' ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' :
                                    'bg-gray-600/20 text-gray-400 border border-gray-600/30'
                                  }>
                                    {userStatus === 'premium' ? 'Premium' :
                                     isExpired ? 'Expired' :
                                     userStatus === 'pending' ? 'Free (Pending)' :
                                     userStatus === 'cancelled' ? 'Free (Cancelled)' :
                                     userStatus === 'rejected' ? 'Free (Rejected)' : 'Free'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-sm">{sub.startDate ? new Date(sub.startDate).toLocaleDateString() : '—'}</TableCell>
                                <TableCell className="text-sm">
                                  <span className={isExpired ? 'text-red-400' : ''}>
                                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : '—'}
                                  </span>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    {sub.status === 'pending' && (
                                      <Button size="sm" variant="outline"
                                        className="border-gray-700 text-green-400 hover:bg-green-400/10 h-8 px-2"
                                        disabled={subsActionLoading === sub.id}
                                        onClick={() => handleSubsAction(sub.id, 'approved')}
                                        title="Activate"
                                      >
                                        {subsActionLoading === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                      </Button>
                                    )}
                                    {isActive && (
                                      <Button size="sm" variant="outline"
                                        className="border-gray-700 text-yellow-400 hover:bg-yellow-400/10 h-8 px-2"
                                        disabled={subsActionLoading === sub.id}
                                        onClick={() => handleSubsAction(sub.id, 'cancelled')}
                                        title="Cancel"
                                      >
                                        {subsActionLoading === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                      </Button>
                                    )}
                                    {(sub.status === 'cancelled' || isExpired) && (
                                      <Button size="sm" variant="outline"
                                        className="border-gray-700 text-green-400 hover:bg-green-400/10 h-8 px-2"
                                        disabled={subsActionLoading === sub.id}
                                        onClick={() => handleSubsAction(sub.id, 'approved')}
                                        title="Re-activate"
                                      >
                                        {subsActionLoading === sub.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                      </Button>
                                    )}
                                    <Button size="sm" variant="outline"
                                      className="border-gray-700 text-blue-400 hover:bg-blue-400/10 h-8 px-2 text-xs"
                                      onClick={() => { setExtendingSubId(sub.id); setExtendDays('30') }}
                                      title="Extend"
                                    >
                                      +Days
                                    </Button>
                                    <Button size="sm" variant="outline"
                                      className="border-gray-700 text-red-400 hover:bg-red-400/10 h-8 px-2"
                                      onClick={() => setDeletingSubId(sub.id)}
                                      title="Delete"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                      {subsTotalPages > 1 && (
                        <div className="flex items-center justify-between mt-4">
                          <p className="text-sm text-gray-400">Page {subsPage} of {subsTotalPages}</p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="border-gray-700 text-white"
                              disabled={subsPage === 1}
                              onClick={() => { const p = subsPage - 1; setSubsPage(p); fetchSubscriptions(p, subsStatusFilter) }}
                            >Previous</Button>
                            <Button size="sm" variant="outline" className="border-gray-700 text-white"
                              disabled={subsPage === subsTotalPages}
                              onClick={() => { const p = subsPage + 1; setSubsPage(p); fetchSubscriptions(p, subsStatusFilter) }}
                            >Next</Button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-center py-12 text-muted-foreground">No subscriptions found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}


        </div>
      </main>
    </div>
  )
}
