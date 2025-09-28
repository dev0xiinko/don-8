"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, LineChart, PieChart, TrendingUp, Users, DollarSign } from "lucide-react"
import { 
  DonationTrendChart, 
  DonorGrowthChart, 
  CampaignPerformanceChart,
  DonationSourcesChart,
  DonationByCampaignChart,
  DonorDemographicsChart,
  DonorRetentionChart,
  CampaignTimelineChart,
  CampaignCategoriesChart,
  AnonymousVsNonAnonymousDonorsChart
} from "@/components/ui/charts"

export default function NGOAnalytics() {
  const [activeTab, setActiveTab] = useState("donations")

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <div className="flex items-center space-x-2">
          <select className="border rounded-md px-3 py-2 text-sm">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 12 months</option>
            <option>All time</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donations</p>
                <h3 className="text-2xl font-bold">$125,430</h3>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Donors</p>
                <h3 className="text-2xl font-bold">1,245</h3>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +8.3% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Avg. Donation</p>
                <h3 className="text-2xl font-bold">$98.50</h3>
                <p className="text-xs text-green-500 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +3.2% from last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Analytics</CardTitle>
          <CardDescription>
            View detailed analytics about your donations, donors, and campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="donations">Donations</TabsTrigger>
              <TabsTrigger value="donors">Donors</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>
            
            <TabsContent value="donations" className="space-y-4">
              <div className="h-80 w-full rounded-lg overflow-hidden">
                <DonationTrendChart />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-60 rounded-lg overflow-hidden">
                  <DonationSourcesChart />
                </div>
                <div className="h-60 rounded-lg overflow-hidden">
                  <DonationByCampaignChart />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="donors" className="space-y-4">
              <div className="h-80 w-full rounded-lg overflow-hidden">
                <DonorGrowthChart />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-60 rounded-lg overflow-hidden">
                  <DonorDemographicsChart />
                </div>
                <div className="h-60 rounded-lg overflow-hidden">
                  <DonorRetentionChart />
                </div>
                <div className="h-60 rounded-lg overflow-hidden">
                  <AnonymousVsNonAnonymousDonorsChart />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="campaigns" className="space-y-4">
              <div className="h-80 w-full rounded-lg overflow-hidden">
                <CampaignPerformanceChart />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-60 rounded-lg overflow-hidden">
                  <CampaignTimelineChart />
                </div>
                <div className="h-60 rounded-lg overflow-hidden">
                  <CampaignCategoriesChart />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest donations and campaign activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">New donation received</p>
                    <p className="text-xs text-gray-500">{item} day{item !== 1 ? 's' : ''} ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${Math.floor(Math.random() * 500) + 50}</p>
                  <p className="text-xs text-gray-500">Campaign #{Math.floor(Math.random() * 5) + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest donations and campaign activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">New donation received</p>
                    <p className="text-xs text-gray-500">{item} day{item !== 1 ? 's' : ''} ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${Math.floor(Math.random() * 500) + 50}</p>
                  <p className="text-xs text-gray-500">Campaign #{Math.floor(Math.random() * 5) + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}