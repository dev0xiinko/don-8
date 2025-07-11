"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Heart,
  TrendingUp,
  Eye,
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  BarChart3,
  Users,
  Target,
  LogOut,
  Shield,
} from "lucide-react"
import { useWeb3Auth } from "@/context/Web3AuthProvider"

export default function DonorDashboard() {
  const router = useRouter()
  const { isConnected, userInfo, walletInfo, logout } = useWeb3Auth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    // Redirect to login if not connected
    if (!isConnected) {
      router.push("/login")
    }
  }, [isConnected, router])

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Mock data for NGOs
  const ngos = [
    {
      id: 1,
      name: "Education for All Foundation",
      description: "Providing quality education to underprivileged children worldwide",
      category: "Education",
      location: "Philippines",
      score: 95,
      totalRaised: 125000,
      goal: 200000,
      donors: 1250,
      image: "/placeholder.svg?height=60&width=60",
      verified: true,
      lastUpdate: "2 days ago",
    },
    {
      id: 2,
      name: "Clean Water Initiative",
      description: "Building wells and water systems in rural communities",
      category: "Environment",
      location: "Kenya",
      score: 92,
      totalRaised: 89000,
      goal: 150000,
      donors: 890,
      image: "/placeholder.svg?height=60&width=60",
      verified: true,
      lastUpdate: "1 day ago",
    },
    {
      id: 3,
      name: "Healthcare Heroes",
      description: "Supporting frontline healthcare workers and medical supplies",
      category: "Healthcare",
      location: "Global",
      score: 88,
      totalRaised: 67000,
      goal: 100000,
      donors: 567,
      image: "/placeholder.svg?height=60&width=60",
      verified: true,
      lastUpdate: "3 hours ago",
    },
  ]

  // Mock data for recent donations
  const recentDonations = [
    {
      id: 1,
      ngo: "Education for All Foundation",
      amount: 250,
      date: "2025-01-10",
      status: "Completed",
    },
    {
      id: 2,
      ngo: "Clean Water Initiative",
      amount: 500,
      date: "2025-01-08",
      status: "Completed",
    },
  ]

  const filteredNGOs = ngos.filter((ngo) => {
    const matchesSearch =
      ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ngo.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || ngo.category.toLowerCase() === selectedCategory
    return matchesSearch && matchesCategory
  })

  if (!isConnected) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D8</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DON-8</span>
            </Link>
            <Badge variant="secondary">Donor Dashboard</Badge>
          </div>
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="text-sm text-gray-600">
              <span>Welcome, {userInfo?.name || "User"}</span>
            </div>

            {/* Wallet Info */}
            {walletInfo && (
              <div className="text-xs text-gray-500">
                <div>{Number(walletInfo.balance).toFixed(4)} ETH</div>
              </div>
            )}

            {/* Profile Avatar */}
            <Avatar>
              <AvatarImage src={userInfo?.profileImage || "/placeholder.svg?height=32&width=32"} />
              <AvatarFallback>{userInfo?.name?.substring(0, 2) || "U"}</AvatarFallback>
            </Avatar>

            {/* Logout Button */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, {userInfo?.name || "User"}! 👋</h1>
          <p className="text-gray-600">Your Web3Auth account is connected. Start making transparent donations today.</p>

          {/* Connection Info */}
          <div className="flex items-center space-x-4 mt-2">
            <Badge variant="outline" className="text-xs">
              {userInfo?.typeOfLogin || "Web3Auth"}
            </Badge>
            {walletInfo && (
              <Badge variant="outline" className="text-xs font-mono">
                {walletInfo.address.substring(0, 6)}...{walletInfo.address.substring(38)}
              </Badge>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2,750</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">NGOs Supported</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">+2 this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Impact Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94</div>
              <p className="text-xs text-muted-foreground">Excellent rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {walletInfo ? `${Number(walletInfo.balance).toFixed(4)}` : "0.0000"}
              </div>
              <p className="text-xs text-muted-foreground">ETH</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardHeader>
                <CardTitle>Discover NGOs</CardTitle>
                <CardDescription>Find verified organizations to support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search NGOs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="environment">Environment</SelectItem>
                      <SelectItem value="poverty">Poverty</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* NGO List */}
            <div className="space-y-4">
              {filteredNGOs.map((ngo) => (
                <Card key={ngo.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={ngo.image || "/placeholder.svg"} />
                        <AvatarFallback>{ngo.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{ngo.name}</h3>
                          {ngo.verified && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Score: {ngo.score}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{ngo.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {ngo.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {ngo.donors} donors
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {ngo.lastUpdate}
                          </div>
                        </div>
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span>Progress</span>
                            <span>{Math.round((ngo.totalRaised / ngo.goal) * 100)}%</span>
                          </div>
                          <Progress value={(ngo.totalRaised / ngo.goal) * 100} className="h-2" />
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>${ngo.totalRaised.toLocaleString()} raised</span>
                            <span>Goal: ${ngo.goal.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Link href={`/donate/${ngo.id}`}>
                            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                              <Heart className="w-4 h-4 mr-2" />
                              Donate
                            </Button>
                          </Link>
                          <Link href={`/ngo/${ngo.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Web3Auth Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Web3Auth Account
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={userInfo?.profileImage || "/placeholder.svg"} />
                      <AvatarFallback>{userInfo?.name?.substring(0, 2) || "U"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{userInfo?.name || "Web3 User"}</div>
                      <div className="text-sm text-gray-500">{userInfo?.email}</div>
                    </div>
                  </div>
                  {walletInfo && (
                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-600 mb-1">Wallet Address</div>
                      <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{walletInfo.address}</div>
                      <div className="flex items-center justify-between text-sm mt-2">
                        <span>Balance:</span>
                        <span className="font-medium">{Number(walletInfo.balance).toFixed(4)} ETH</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span>Login Method:</span>
                    <Badge variant="outline">{userInfo?.typeOfLogin || "Web3Auth"}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Recent Donations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{donation.ngo}</p>
                        <p className="text-xs text-gray-500">{donation.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-sm">${donation.amount}</p>
                        <Badge variant="secondary" className="text-xs">
                          {donation.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/donor/history">
                  <Button variant="outline" className="w-full mt-4 bg-transparent">
                    View All History
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/donor/analytics">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
                <Link href="/donor/tracking">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Eye className="w-4 h-4 mr-2" />
                    Track Donations
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start bg-transparent" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
