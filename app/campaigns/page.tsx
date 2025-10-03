"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, MapPin, Users, Target, ArrowRight, Search, Filter } from 'lucide-react'
import useAuthRedirect from "@/hooks/useAuthRedirect"
import Link from "next/link"

interface Campaign {
  id: string
  title: string
  description: string
  ngo: string
  location: string
  category: string
  target: number
  raised: number
  donors: number
  daysLeft: number
  image: string
  urgent: boolean
  featured: boolean
  status: 'active' | 'completed' | 'paused'
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Clean Water for Rural Communities",
    description: "Providing access to clean drinking water for 500 families in remote villages through well construction and water purification systems.",
    ngo: "Water for Life Foundation",
    location: "Rural Philippines",
    category: "Water & Sanitation",
    target: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 15,
  image: "/flood.png",
    urgent: true,
    featured: true,
    status: 'active'
  },
  {
    id: "2",
    title: "Education Support for Underprivileged Children",
    description: "Supporting 200 children with school supplies, uniforms, and educational materials to ensure they can continue their studies.",
    ngo: "Hope for Tomorrow",
    location: "Metro Manila",
    category: "Education",
    target: 25000,
    raised: 18750,
    donors: 156,
    daysLeft: 8,
  image: "/flood.png",
    urgent: true,
    featured: false,
    status: 'active'
  },
  {
    id: "3",
    title: "Medical Equipment for Community Hospital",
    description: "Purchasing essential medical equipment including ventilators, monitors, and surgical tools for a community hospital serving 10,000 residents.",
    ngo: "Healthcare Heroes",
    location: "Cebu City",
    category: "Healthcare",
    target: 100000,
    raised: 45000,
    donors: 89,
    daysLeft: 30,
  image: "/flood.png",
    urgent: false,
    featured: true,
    status: 'active'
  },
  {
    id: "4",
    title: "Disaster Relief for Typhoon Victims",
    description: "Emergency relief packages including food, water, clothing, and temporary shelter materials for families affected by recent typhoon.",
    ngo: "Rapid Response Network",
    location: "Bicol Region",
    category: "Disaster Relief",
    target: 75000,
    raised: 68250,
    donors: 412,
    daysLeft: 5,
  image: "/flood.png",
    urgent: true,
    featured: true,
    status: 'active'
  },
  {
    id: "5",
    title: "Reforestation Project",
    description: "Planting 10,000 native trees to restore degraded forest areas and combat climate change while providing livelihood for local communities.",
    ngo: "Green Earth Initiative",
    location: "Baguio City",
    category: "Environment",
    target: 30000,
    raised: 12000,
    donors: 78,
    daysLeft: 45,
    image: "/api/placeholder/400/250",
    urgent: false,
    featured: false,
    status: 'active'
  },
  {
    id: "6",
    title: "Feeding Program for Street Children",
    description: "Daily nutritious meals for 100 street children, including vitamins and health monitoring to ensure proper growth and development.",
    ngo: "Children's Haven",
    location: "Davao City",
    category: "Child Welfare",
    target: 40000,
    raised: 35600,
    donors: 203,
    daysLeft: 20,
    image: "/api/placeholder/400/250",
    urgent: false,
    featured: true,
    status: 'active'
  }
]

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("urgent")
  const { redirectToDonate } = useAuthRedirect()

  const formatCurrency = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 SONIC'
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)} SONIC`
  }

  const calculateProgress = (raised: number, target: number) => {
    return Math.round((raised / target) * 100)
  }

  const filteredAndSortedCampaigns = mockCampaigns
    .filter(campaign => {
      const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.ngo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
      const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "urgent":
          if (a.urgent && !b.urgent) return -1
          if (!a.urgent && b.urgent) return 1
          return a.daysLeft - b.daysLeft
        case "progress":
          return calculateProgress(b.raised, b.target) - calculateProgress(a.raised, a.target)
        case "target":
          return b.target - a.target
        case "recent":
          return a.daysLeft - b.daysLeft
        default:
          return 0
      }
    })

  const categories = Array.from(new Set(mockCampaigns.map(c => c.category)))

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Campaigns</h1>
              <p className="text-gray-600 mt-1">Discover and support meaningful causes</p>
            </div>
            <Link href="/">
              <Button variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">Most Urgent</SelectItem>
                <SelectItem value="progress">Highest Progress</SelectItem>
                <SelectItem value="target">Highest Target</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredAndSortedCampaigns.length} of {mockCampaigns.length} campaigns
          </p>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredAndSortedCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={campaign.image} 
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.urgent && (
                    <Badge variant="destructive" className="bg-red-500">
                      Urgent
                    </Badge>
                  )}
                  {campaign.featured && (
                    <Badge className="bg-emerald-500">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant="secondary" className="bg-white/90">
                    {campaign.category}
                  </Badge>
                </div>
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {campaign.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* NGO and Location */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{campaign.ngo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{campaign.location}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatCurrency(campaign.raised)} raised
                    </span>
                    <span className="text-gray-600">
                      {calculateProgress(campaign.raised, campaign.target)}%
                    </span>
                  </div>
                  <Progress value={calculateProgress(campaign.raised, campaign.target)} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Goal: {formatCurrency(campaign.target)}</span>
                    <span>{campaign.donors} donors</span>
                  </div>
                </div>

                {/* Time Left */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>
                    {campaign.daysLeft > 0 
                      ? `${campaign.daysLeft} days left`
                      : 'Campaign ended'
                    }
                  </span>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 group"
                  onClick={() => redirectToDonate(campaign.id)}
                  disabled={campaign.status !== 'active'}
                >
                  {campaign.status === 'active' ? 'Donate Now' : 'Campaign Ended'}
                  {campaign.status === 'active' && (
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredAndSortedCampaigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Filter className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}