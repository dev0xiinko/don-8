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
    title: "Emergency Relief for Flood Victims",
    description: "Providing immediate shelter, food, and medical aid to families affected by recent flooding in rural communities.",
    ngo: "Disaster Relief Foundation",
    location: "Bangladesh",
    category: "Emergency Relief",
    target: 50000,
    raised: 32500,
    donors: 245,
    daysLeft: 12,
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
    location: "Sierra Madre",
    category: "Environment",
    target: 35000,
    raised: 12250,
    donors: 78,
    daysLeft: 45,
    image: "/flood.png",
    urgent: false,
    featured: false,
    status: 'active'
  }
]

export default function CampaignsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  
  // Use the auth redirect hook
  useAuthRedirect()
  
  // Filter campaigns based on search and filters
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const matchesSearch = campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          campaign.ngo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || campaign.category === categoryFilter
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Campaign Details</h1>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search campaigns..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Water & Sanitation">Water & Sanitation</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Disaster Relief">Disaster Relief</SelectItem>
              <SelectItem value="Environment">Environment</SelectItem>
              <SelectItem value="Emergency Relief">Emergency Relief</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Campaign cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map(campaign => (
          <Card key={campaign.id} className="overflow-hidden">
            <div className="relative h-48 bg-gray-100">
              <img 
                src={campaign.image} 
                alt={campaign.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 flex gap-2">
                {campaign.urgent && (
                  <Badge variant="destructive">Urgent</Badge>
                )}
                {campaign.featured && (
                  <Badge variant="secondary">Featured</Badge>
                )}
              </div>
            </div>
            
            <CardHeader>
              <CardTitle className="line-clamp-2">{campaign.title}</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {campaign.location}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-sm line-clamp-3">{campaign.description}</p>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">${campaign.raised.toLocaleString()} raised</span>
                  <span className="text-muted-foreground">of ${campaign.target.toLocaleString()}</span>
                </div>
                <Progress value={(campaign.raised / campaign.target) * 100} className="h-2" />
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" /> {campaign.donors} donors
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {campaign.daysLeft} days left
                  </span>
                </div>
              </div>
              
              <Link href={`/donate/${campaign.id}`} passHref>
                <Button className="w-full">
                  Donate Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredCampaigns.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium">No campaigns found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  )
}