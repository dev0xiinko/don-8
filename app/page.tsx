"use client"
import { useState, useEffect } from "react"
import { Header } from "@/components/homepage/layout/Header"
import { HeroSection } from "@/components/homepage/sections/HeroSection"
import { FeaturesSection } from "@/components/homepage/sections/FeatureSection"
import { StepsSection } from "@/components/homepage/sections/StepsSection"
import { CTASection } from "@/components/homepage/sections/CTASection"
import { Footer } from "@/components/homepage/layout/Footer"
import { features } from "@/mock/data/features"
import { stats as initialStats } from "@/mock/data/stats"
import { steps } from "@/mock/data/steps"
import { CampaignsSection } from "@/components/homepage/sections/CampaignSection"

// const WorldMap = dynamic(() => import('@/components/homepage/sections/WorldMap').then(mod => mod.WorldMapFeature), {
//   loading: () => <p className="text-center">Loading...</p>, // Optional fallback
//   ssr: false, // Optional: disables server-side rendering
// });

export default function HomePage() {
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)

  // Fetch and calculate real statistics from all campaigns
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/campaigns')
        const result = await response.json()
        if (result.success) {
          const campaigns = result.campaigns || []
          
          // Calculate aggregated stats from all campaigns
          let totalRaised = 0
          let totalDonations = 0
          const uniqueDonors = new Set()
          let activeCampaigns = 0
          
          campaigns.forEach((campaign: any) => {
            if (campaign.status === 'active') {
              activeCampaigns++
            }
            
            // Use comprehensive stats from the enhanced API
            if (campaign.raisedAmount) {
              totalRaised += parseFloat(campaign.raisedAmount.toString() || 0)
            }
            
            if (campaign.totalDonations) {
              totalDonations += parseInt(campaign.totalDonations.toString() || 0)
            }
            
            // Count unique donors from comprehensive data
            if (campaign.donations && Array.isArray(campaign.donations)) {
              const confirmedDonations = campaign.donations.filter((d: any) => d.status === 'confirmed')
              confirmedDonations.forEach((donation: any) => {
                if (donation.donorAddress) {
                  uniqueDonors.add(donation.donorAddress.toLowerCase())
                }
              })
            }
          })
          
          // Update stats with real data
          setStats([
            { 
              value: `${totalRaised.toFixed(2)} SONIC`, 
              label: "Total Donated" 
            },
            { 
              value: activeCampaigns.toString(), 
              label: "Active Campaigns" 
            },
            { 
              value: uniqueDonors.size.toString(), 
              label: "Unique Donors" 
            },
            { 
              value: "100%", 
              label: "Transparency Rate" 
            },
          ])
          
          console.log('Homepage stats updated:', {
            totalRaised: `${totalRaised.toFixed(2)} SONIC`,
            activeCampaigns,
            uniqueDonors: uniqueDonors.size,
            totalDonations
          })
        }
      } catch (error) {
        console.error('Error fetching homepage stats:', error)
        // Keep default stats on error
      } finally {
        setLoading(false)
      }
    }
    
    fetchStats()
    
    // Auto-refresh stats every 60 seconds
    const interval = setInterval(fetchStats, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection stats={stats} />
      <CampaignsSection />
      <FeaturesSection features={features} />
      <StepsSection steps={steps} />
      <CTASection />
      <Footer />
    </div>
  )
}
