"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, MapPin, Users, Target, ArrowRight } from 'lucide-react'
import useAuthRedirect from "@/hooks/useAuthRedirect"
import type { Campaign } from "@/lib/mock-data"
import { SafeImage } from "@/components/ui/safe-image"
import { preloadCampaignImages } from "@/lib/image-utils"

// Enhanced campaign interface with real donation stats
interface EnhancedCampaign extends Campaign {
  totalDonations?: number
  raisedAmount?: number
}

export function CampaignsSection() {
  const [filter, setFilter] = useState<'all' | 'urgent' | 'featured'>('all')
  const [campaigns, setCampaigns] = useState<EnhancedCampaign[]>([])
  const [loading, setLoading] = useState(true)
  const { redirectToDonate, redirectToCampaigns } = useAuthRedirect()
  
  // Fetch campaigns from comprehensive API with real stats
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Fetch all campaigns with comprehensive data (includes donations)
        const response = await fetch('/api/campaigns')
        const result = await response.json()
        if (result.success) {
          // The API now returns enriched campaigns with real donation stats
          const enrichedCampaigns = result.campaigns.map((campaign: any) => ({
            ...campaign,
            // Use the stats already calculated by the API from comprehensive files
            raisedAmount: campaign.raisedAmount || 0,
            currentAmount: campaign.currentAmount || campaign.raisedAmount || 0,
            donorCount: campaign.donorCount || 0,
            totalDonations: campaign.totalDonations || 0
          }))
          
          setCampaigns(enrichedCampaigns)
          
          // Debug: Log campaign stats
          console.log('Campaigns loaded with real stats:', enrichedCampaigns.length)
          enrichedCampaigns.forEach((campaign: any, index: number) => {
            console.log(`Campaign ${index + 1}:`, {
              id: campaign.id,
              title: campaign.title || campaign.name,
              totalRaised: campaign.raisedAmount,
              donorCount: campaign.donorCount,
              totalDonations: campaign.totalDonations,
              imageUrl: campaign.imageUrl
            })
          })
          
          // Preload campaign images for better performance
          setTimeout(() => {
            preloadCampaignImages(enrichedCampaigns)
          }, 100)
        }
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCampaigns()
    
    // Auto-refresh every 10 seconds to keep donation stats current
    const interval = setInterval(fetchCampaigns, 10000)
    return () => clearInterval(interval)
  }, [])
  
  const filteredCampaigns = campaigns.filter(campaign => {
    if (filter === 'urgent') return campaign.urgencyLevel === 'urgent'
    if (filter === 'featured') return campaign.featured === true
    return campaign.status === 'active' // Only show active campaigns
  })

  const formatAmount = (amount: number) => {
    if (!amount || isNaN(amount)) return '0 SONIC'
    return `${new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount)} SONIC`
  }

  const getProgressPercentage = (raised: number, target: number) => {
    if (!target || target <= 0 || !raised || raised < 0) return 0
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

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <Target className="w-16 h-16 mx-auto opacity-50" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Campaigns Yet</h3>
            <p className="text-gray-500 mb-4">
              NGOs are working on creating meaningful campaigns to support communities in need.
            </p>
            <Button variant="outline" onClick={() => window.location.href = '/register'}>
              Register Your NGO
            </Button>
          </div>
        ) : (
          /* Campaigns Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCampaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative">
                <SafeImage
                  campaign={campaign}
                  alt={campaign.title || campaign.name || 'Campaign Image'}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  fallback="/flood.png"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {campaign.urgencyLevel === 'urgent' && (
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
                {campaign.category && (
                  <div className="absolute top-4 right-4">
                    <Badge className={getCategoryColor(campaign.category)}>
                      {campaign.category}
                    </Badge>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="text-lg line-clamp-2 group-hover:text-emerald-600 transition-colors">
                  {campaign.title || 'Untitled Campaign'}
                </CardTitle>
                <CardDescription className="line-clamp-3 text-sm leading-relaxed">
                  {campaign.longDescription || campaign.description || 'No description available'}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* NGO and Location */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="font-medium">{campaign.ngoName || 'Unknown NGO'}</span>
                  {campaign.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{campaign.location}</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">
                      {formatAmount(campaign.raisedAmount || campaign.currentAmount || 0)} raised
                    </span>
                    <span className="text-muted-foreground">
                      of {formatAmount(campaign.targetAmount)}
                    </span>
                  </div>
                  <Progress 
                    value={getProgressPercentage(campaign.raisedAmount || campaign.currentAmount || 0, campaign.targetAmount)} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground">
                    {getProgressPercentage(campaign.raisedAmount || campaign.currentAmount || 0, campaign.targetAmount).toFixed(1)}% funded
                  </div>
                </div>

                {/* Campaign Impact */}
                {campaign.beneficiaries && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-emerald-600">
                      {campaign.beneficiaries.toLocaleString()}
                    </span>
                    <span className="ml-1">people to be helped</span>
                  </div>
                )}

                {/* Campaign Tags */}
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {campaign.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Stats - Real donation data */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{campaign.donorCount || 0} donors</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>{campaign.totalDonations || 0} donations</span>
                  </div>
                </div>
                
                {/* Time remaining */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>
                    {campaign.endDate ? (() => {
                      const daysLeft = Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
                      return daysLeft > 0 ? `${daysLeft} days left` : 'Campaign ended';
                    })() : 'Ongoing campaign'}
                  </span>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 group"
                  onClick={() => redirectToDonate(campaign.id.toString())}
                >
                  Visit Campaign
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
          </div>
        )}
      </div>
    </section>
  )
}