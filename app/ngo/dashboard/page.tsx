"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Upload,
  Eye,
  Settings,
  LogOut,
  Star,
  Zap,
} from "lucide-react"

export default function NGODashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userInfo, setUserInfo] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState("")

  // Mock user data from Web3Auth
  useEffect(() => {
    // Simulate getting user info from Web3Auth
    setUserInfo({
      name: "Education for All Foundation",
      email: "contact@educationforall.org",
      profileImage: "/placeholder.svg?height=32&width=32",
    })
    setWalletAddress(`0x${Math.random().toString(16).substr(2, 40)}`)
  }, [])

  // Mock data for NGO
  const ngoData = {
    name: "Education for All Foundation",
    score: 95,
    totalRaised: 125000,
    goal: 200000,
    donors: 1250,
    campaigns: 3,
    compliance: 98,
    lastAudit: "2025-01-05",
  }

  // Mock data for recent donations
  const recentDonations = [
    {
      id: 1,
      donor: "Anonymous",
      amount: 0.5,
      currency: "S",
      date: "2025-01-10",
      txHash: "0x1234...5678",
      isAnonymous: true,
    },
    {
      id: 2,
      donor: "John D.",
      amount: 1.2,
      currency: "S",
      date: "2025-01-09",
      txHash: "0x9876...5432",
      isAnonymous: false,
    },
    {
      id: 3,
      donor: "Anonymous",
      amount: 0.8,
      currency: "S",
      date: "2025-01-08",
      txHash: "0x5555...7777",
      isAnonymous: true,
    },
  ]
  
  // Mock data for donors list
  const donorsList = [
    {
      id: 1,
      name: "Anonymous",
      totalDonated: 2.5,
      currency: "S",
      lastDonation: "2025-01-10",
      donationsCount: 5,
      isAnonymous: true,
    },
    {
      id: 2,
      name: "John Doe",
      totalDonated: 3.2,
      currency: "S",
      lastDonation: "2025-01-09",
      donationsCount: 3,
      isAnonymous: false,
    },
    {
      id: 3,
      name: "Sarah Smith",
      totalDonated: 1.8,
      currency: "S",
      lastDonation: "2025-01-08",
      donationsCount: 2,
      isAnonymous: false,
    },
    {
      id: 4,
      name: "Anonymous",
      totalDonated: 0.5,
      currency: "S",
      lastDonation: "2025-01-07",
      donationsCount: 1,
      isAnonymous: true,
    },
    {
      id: 5,
      name: "Michael Johnson",
      totalDonated: 5.0,
      currency: "S",
      lastDonation: "2025-01-06",
      donationsCount: 4,
      isAnonymous: false,
    },
  ]

  // Mock data for campaigns
  const campaigns = [
    {
      id: 1,
      title: "School Building Project",
      description: "Building new classrooms for 500 students",
      raised: 75000,
      goal: 100000,
      donors: 450,
      status: "Active",
      endDate: "2025-03-15",
    },
    {
      id: 2,
      title: "Teacher Training Program",
      description: "Training 50 teachers in modern education methods",
      raised: 30000,
      goal: 50000,
      donors: 200,
      status: "Active",
      endDate: "2025-02-28",
    },
    {
      id: 3,
      title: "Digital Learning Initiative",
      description: "Providing tablets and internet access to students",
      raised: 20000,
      goal: 50000,
      donors: 150,
      status: "Planning",
      endDate: "2025-04-30",
    },
  ]

  // Mock data for compliance tasks
  const complianceTasks = [
    {
      id: 1,
      title: "Monthly Financial Report",
      dueDate: "2025-01-15",
      status: "Pending",
      priority: "High",
    },
    {
      id: 2,
      title: "Project Impact Assessment",
      dueDate: "2025-01-20",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Donor Communication Update",
      dueDate: "2025-01-25",
      status: "Completed",
      priority: "Low",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">D8</span>
              </div>
              <span className="text-xl font-bold text-gray-900">DON-8</span>
            </Link>
            <Badge variant="secondary">NGO Dashboard</Badge>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-sm text-green-700">Web3Auth Connected</span>
            </div>
            <Badge variant="outline" className="text-xs">
              SonicLabs Network
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Score: {ngoData.score}</span>
            </Badge>
            <Avatar>
              <AvatarImage src={userInfo?.profileImage || "/placeholder.svg?height=32&width=32"} />
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Organization Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" />
              <AvatarFallback>EF</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ngoData.name}</h1>
              <p className="text-gray-600">Providing quality education to underprivileged children worldwide</p>
              <div className="flex items-center space-x-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  Web3Auth Verified
                </Badge>
                <Badge variant="outline" className="text-xs">
                  SonicLabs Network
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${ngoData.totalRaised.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((ngoData.totalRaised / ngoData.goal) * 100)}% of goal
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ngoData.donors.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12% this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ngoData.score}</div>
              <p className="text-xs text-muted-foreground">Excellent rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ngoData.compliance}%</div>
              <p className="text-xs text-muted-foreground">All requirements met</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Donations */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Donations</CardTitle>
                    <CardDescription>Latest contributions from your supporters on SonicLabs Network</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{donation.donor.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{donation.donor}</p>
                              <p className="text-sm text-gray-500">{donation.date}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {donation.amount} {donation.currency}
                            </p>
                            <p className="text-xs text-gray-500">{donation.txHash}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Web3Auth Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-500" />
                      Web3Auth Account
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img
                          src={userInfo?.profileImage || "/placeholder.svg?height=40&width=40"}
                          alt="Profile"
                          className="w-10 h-10 rounded-full"
                        />
                        <div>
                          <div className="font-medium">{userInfo?.name}</div>
                          <div className="text-sm text-gray-500">{userInfo?.email}</div>
                        </div>
                      </div>
                      <div className="border-t pt-3">
                        <div className="text-sm text-gray-600 mb-1">Wallet Address</div>
                        <div className="font-mono text-xs bg-gray-50 p-2 rounded break-all">{walletAddress}</div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Network:</span>
                        <Badge variant="outline">SonicLabs</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full justify-start">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Report
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <FileText className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </CardContent>
                </Card>

                {/* Compliance Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                      Compliance Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Overall Score</span>
                        <Badge variant="secondary">{ngoData.compliance}%</Badge>
                      </div>
                      <Progress value={ngoData.compliance} className="h-2" />
                      <p className="text-xs text-gray-500">Last audit: {ngoData.lastAudit}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Active Campaigns</h2>
              <Button>
                <FileText className="w-4 h-4 mr-2" />
                Create New Campaign
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{campaign.title}</CardTitle>
                      <Badge variant={campaign.status === "Active" ? "default" : "secondary"}>{campaign.status}</Badge>
                    </div>
                    <CardDescription>{campaign.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{Math.round((campaign.raised / campaign.goal) * 100)}%</span>
                        </div>
                        <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>${campaign.raised.toLocaleString()}</span>
                          <span>Goal: ${campaign.goal.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{campaign.donors} donors</span>
                        <span>Ends: {campaign.endDate}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Compliance Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Tasks</CardTitle>
                  <CardDescription>Complete these tasks to maintain your compliance score</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {complianceTasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          {task.status === "Completed" ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : task.status === "In Progress" ? (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          )}
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-sm text-gray-500">Due: {task.dueDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              task.priority === "High"
                                ? "destructive"
                                : task.priority === "Medium"
                                  ? "default"
                                  : "secondary"
                            }
                          >
                            {task.priority}
                          </Badge>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Compliance Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Breakdown</CardTitle>
                  <CardDescription>How your compliance score is calculated</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>Financial Reporting</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={95} className="w-20 h-2" />
                        <span className="text-sm font-medium">95%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Project Updates</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={100} className="w-20 h-2" />
                        <span className="text-sm font-medium">100%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Donor Communication</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={98} className="w-20 h-2" />
                        <span className="text-sm font-medium">98%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Fund Utilization</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={97} className="w-20 h-2" />
                        <span className="text-sm font-medium">97%</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-semibold">
                        <span>Overall Score</span>
                        <span className="text-lg">{ngoData.compliance}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="donors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Donors List</CardTitle>
                <CardDescription>View all donors and their contribution details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Donor</th>
                        <th className="text-left py-3 px-4">Total Donated</th>
                        <th className="text-left py-3 px-4">Donations</th>
                        <th className="text-left py-3 px-4">Last Donation</th>
                        <th className="text-left py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {donorsList.map((donor) => (
                        <tr key={donor.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="w-8 h-8">
                                {donor.isAnonymous ? (
                                  <AvatarFallback className="bg-gray-200 text-gray-600">A</AvatarFallback>
                                ) : (
                                  <AvatarFallback>{donor.name.substring(0, 2)}</AvatarFallback>
                                )}
                              </Avatar>
                              <span>{donor.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {donor.totalDonated} {donor.currency}
                          </td>
                          <td className="py-3 px-4">{donor.donationsCount}</td>
                          <td className="py-3 px-4">{donor.lastDonation}</td>
                          <td className="py-3 px-4">
                            {donor.isAnonymous ? (
                              <Badge variant="outline" className="bg-gray-100">
                                Anonymous
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-green-100 text-green-800">
                                Public
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Donation Trends</CardTitle>
                  <CardDescription>Monthly donation performance on SonicLabs Network</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Donor Demographics</CardTitle>
                  <CardDescription>Geographic distribution of supporters</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Map visualization would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
