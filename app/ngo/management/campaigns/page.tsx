"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Plus } from "lucide-react"

export default function NGOCampaigns() {
  // Mock campaign data
  const campaigns = [
    {
      id: 1,
      title: "Education for Rural Areas",
      description: "Providing educational resources to underserved rural communities",
      status: "Active",
      raised: 45000,
      goal: 75000,
      donors: 320,
      daysLeft: 45,
    },
    {
      id: 2,
      title: "Teacher Training Program",
      description: "Professional development for educators in low-income schools",
      status: "Active",
      raised: 28000,
      goal: 50000,
      donors: 210,
      daysLeft: 30,
    },
    {
      id: 3,
      title: "School Supplies Drive",
      description: "Providing essential learning materials to students in need",
      status: "Completed",
      raised: 15000,
      goal: 15000,
      donors: 180,
      daysLeft: 0,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>
      
      <div className="grid gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div>
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription>{campaign.description}</CardDescription>
              </div>
              <Badge className={campaign.status === "Active" ? "bg-green-500 text-white" : "bg-muted"}>
                {campaign.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Raised</div>
                  <div className="text-2xl font-bold">${campaign.raised.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">of ${campaign.goal.toLocaleString()} goal</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Donors</div>
                  <div className="text-2xl font-bold">{campaign.donors}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {campaign.status === "Active" ? "Days Left" : "Status"}
                  </div>
                  <div className="text-2xl font-bold">
                    {campaign.status === "Active" ? campaign.daysLeft : "Completed"}
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline">
                  <Zap className="mr-2 h-4 w-4" />
                  Manage Campaign
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}