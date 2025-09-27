"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Users, Target, ArrowRight } from 'lucide-react'
import useAuthRedirect from "@/hooks/useAuthRedirect"

interface Campaign {
  id: string
  title: string
  description: string
  ngoName: string
  location: string
  category: string
  targetAmount: number
  raisedAmount: number
  donorCount: number
  daysLeft: number
  image: string
  urgent: boolean
  featured: boolean
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    title: "Emergency Relief for Flood Victims",
    description: "Providing immediate shelter, food, and medical aid to families affected by recent flooding in rural communities.",
    ngoName: "Disaster Relief Foundation",
    location: "Bangladesh",
    category: "Emergency Relief",
    targetAmount: 50000,
    raisedAmount: 32500,
    donorCount: 245,
    daysLeft: 12,
    image: "flood.png",
    urgent: true,
    featured: true
  },
  {
    id: "2",
    title: "Clean Water Wells for Remote Villages",
    description: "Building sustainable water infrastructure to provide clean drinking water to 5 remote villages.",
    ngoName: "Water for Life",
    location: "Kenya",
    category: "Water & Sanitation",
    targetAmount: 75000,
    raisedAmount: 45000,
    donorCount: 189,
    daysLeft: 28,
    image: "flood.png",
    urgent: false,
    featured: true
  },
  {
    id: "3",
    title: "Education Scholarships for Girls",
    description: "Supporting 100 girls from low-income families to complete their secondary education with full scholarships.",
    ngoName: "Girls Education Initiative",
    location: "India",
    category: "Education",
    targetAmount: 30000,
    raisedAmount: 18750,
    donorCount: 156,
    daysLeft: 45,
    image: "flood.png",
    urgent: false,
    featured: false
  },
  {
    id: "4",
    title: "Mobile Medical Clinic for Rural Areas",
    description: "Funding a mobile medical unit to provide healthcare services to underserved rural communities.",
    ngoName: "Healthcare Access Network",
    location: "Guatemala",
    category: "Healthcare",
    targetAmount: 85000,
    raisedAmount: 51000,
    donorCount: 298,
    daysLeft: 21,
    image: "flood.png",
    urgent: false,
    featured: true
  },
  {
    id: "5",
    title: "Reforestation Project - Plant 10,000 Trees",
    description: "Combat climate change by planting native trees and restoring degraded forest ecosystems.",
    ngoName: "Green Earth Foundation",
    location: "Brazil",
    category: "Environment",
    targetAmount: 25000,
    raisedAmount: 19500,
    donorCount: 412,
    daysLeft: 35,
    image: "flood.png",
    urgent: false,
    featured: false
  },
  {
    id: "6",
    title: "Winter Clothing Drive for Homeless",
    description: "Providing warm clothing, blankets, and winter essentials to homeless individuals during harsh winter months.",
    ngoName: "Shelter & Care Foundation",
    location: "Canada",
    category: "Social Welfare",
    targetAmount: 15000,
    raisedAmount: 8900,
    donorCount: 87,
    daysLeft: 18,
    image: "flood.png",
    urgent: true,
    featured: false
  }
]

export function CampaignsSection() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'featured'>('all')
  const { redirectToDonate, redirectToCampaigns } = useAuthRedirect()
  
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    if (filter === 'urgent') return campaign.urgent
    if (filter === 'featured') return campaign.featured
    return true
  })

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getProgressPercentage = (raised: number, target: number) => {
    return Math.min((raised / target) * 100, 100)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Emergency Relief': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'Water & Sanitation': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'Education': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      'Healthcare': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'Environment': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      'Social Welfare': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    }
    return colors[category] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <section id="campaigns" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Active Campaigns</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Support ongoing campaigns and make a direct impact on communities worldwide
          </p>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
            >
              All Campaigns
            </Button>
            <Button
              variant={filter === 'urgent' ? 'default' : 'outline'}
              onClick={() => setFilter('urgent')}
              className={filter === 'urgent' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Urgent
            </Button>
            <Button
              variant={filter === 'featured' ? 'default' : 'outline'}
              onClick={() => setFilter('featured')}
              className={filter === 'featured' ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              Featured
            </Button>
          </div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <img
                  src={campaign.image ? `/${campaign.image}` : "/flood.png"}
                  alt={campaign.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.urgent && (
                    <Badge className="bg-red-600 hover:bg-red-700 text-white">
                      Urgent
                    </Badge>
                  )}
                  {campaign.featured && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                      Featured
                    </Badge>
                  )}
                </div>
                <div className="absolute top-4 right-4">
                  <Badge className={getCategoryColor(campaign.category)}>
                    {campaign.category}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {campaign.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {campaign.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* NGO and Location */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium">{campaign.ngoName}</span>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{campaign.location}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatAmount(campaign.raisedAmount)} raised
                    </span>
                    <span className="text-muted-foreground">
                      of {formatAmount(campaign.targetAmount)}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(campaign.raisedAmount, campaign.targetAmount)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage(campaign.raisedAmount, campaign.targetAmount).toFixed(1)}% funded
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{campaign.donorCount} donors</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 group"
                  onClick={() => redirectToDonate(campaign.id)}
                >
                  Donate Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            size="lg" 
            variant="outline" 
            className="group"
            onClick={redirectToCampaigns}
          >
            View All Campaigns
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}