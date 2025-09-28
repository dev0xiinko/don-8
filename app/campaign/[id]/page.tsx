"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Clock, MapPin, Heart } from "lucide-react"
import mockCampaigns from "@/mock/campaignData"
import useAuthRedirect from "@/hooks/useAuthRedirect"
import DonationForm from "@/components/features/donate/DonationForm"
import TransactionHistory from "@/components/features/donate/TransactionHistory"

export default function CampaignDetailsPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { redirectToDonate } = useAuthRedirect()
  
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [hasDonated, setHasDonated] = useState(false)

  useEffect(() => {
    // Find the campaign from mock data
    const foundCampaign = mockCampaigns.find(c => c.id === campaignId)
    if (foundCampaign) {
      setCampaign(foundCampaign)
    }
    setLoading(false)
    
    // Check if user has donated to this campaign (mock data)
    setHasDonated(Math.random() > 0.5) // Random for demo purposes
  }, [campaignId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">Campaign Not Found</h1>
        <Link href="/campaigns">
          <Button>Back to Campaigns</Button>
        </Link>
      </div>
    )
  }

  const progressPercentage = (campaign.raisedAmount / campaign.targetAmount) * 100

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pb-12">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/campaigns" className="flex items-center text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Link>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D8</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DON-8</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - 2/3 width on desktop */}
          <div className="lg:col-span-2 space-y-6">
            {/* NGO Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <span className="font-semibold text-gray-700 dark:text-gray-200">{campaign.ngoName.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">{campaign.ngoName}</h3>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <Badge variant="outline" className="mr-2 dark:border-gray-600 dark:text-gray-300">Score: 95</Badge>
                    <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800">Verified</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Campaign Cover Image */}
            <div className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
              <div className="relative h-80 w-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-xl text-gray-500 dark:text-gray-400">Campaign Cover Image</div>
                <div className="absolute top-4 left-4 flex space-x-2">
                  {campaign.urgent && (
                    <Badge className="bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800">Urgent</Badge>
                  )}
                  {campaign.featured && (
                    <Badge className="bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-800">Featured</Badge>
                  )}
                </div>
                <Badge className="absolute top-4 right-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 shadow-sm">
                  {campaign.category}
                </Badge>
              </div>
            </div>

            {/* Campaign Title and Description */}
            <Card className="shadow-md border-0 dark:bg-gray-800">
              <CardContent className="p-6">
                <h1 className="text-2xl font-bold mb-2 text-emerald-800 dark:text-emerald-400">{campaign.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{campaign.description}</p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{campaign.location}</span>
                  </div>
                </div>
                
                {/* Additional campaign details would go here */}
                <h3 className="font-semibold text-lg mt-6 mb-3 dark:text-white">Campaign Details</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This campaign aims to provide immediate assistance to those affected by the recent flooding. 
                  Your donations will help provide shelter, food, clean water, and medical supplies to families in need.
                </p>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card className="shadow-md border-0 dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-emerald-800 dark:text-emerald-400">History of Transactions</h3>
                <TransactionHistory campaignId={campaignId} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/3 width on desktop */}
          <div className="space-y-6">
            {/* Donation Stats */}
            <Card className="shadow-md border-0 dark:bg-gray-800">
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-emerald-800 dark:text-emerald-400">Total Amount Raised</h3>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-500">${campaign.raisedAmount.toLocaleString()}</span>
                    <span className="text-gray-500 dark:text-gray-400">of ${campaign.targetAmount.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2 bg-emerald-100 dark:bg-emerald-900/30" />
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mt-1">{progressPercentage.toFixed(1)}% funded</p>
                </div>
                
                <div className="flex justify-between text-sm mb-6">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">{campaign.donorCount} donors</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    <span className="dark:text-gray-300">{campaign.daysLeft} days left</span>
                  </div>
                </div>
                
                <DonationForm 
                  campaignId={campaign.id}
                  campaignTitle={campaign.title}
                  onDonationComplete={(amount, isAnonymous, message) => {
                    // Set hasDonated to true after donation
                    setHasDonated(true);
                    
                    // Here you would typically update the transaction history
                    // For now, we'll just show a success message
                    alert(`Thank you for your donation of $${amount}!`);
                  }}
                />
                
                {hasDonated && (
                  <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-md shadow-sm">
                    <p className="text-sm text-emerald-800 dark:text-emerald-300">
                      You have already donated to this campaign. Thank you for your support!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Additional sidebar widgets would go here */}
          </div>
        </div>
      </div>
    </div>
  )
}