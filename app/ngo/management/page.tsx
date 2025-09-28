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

export default function NGOManagement() {
  const [activeTab, setActiveTab] = useState("overview")
  const [userInfo, setUserInfo] = useState<any>(null)
  const [walletAddress, setWalletAddress] = useState("")

  // Mock user data
  useEffect(() => {
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
    campaigns: 5,
    status: "Verified",
    reports: 12,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">DON-8</span>
            </Link>
            <Badge variant="outline" className="ml-2">
              NGO Portal
            </Badge>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userInfo?.profileImage} alt={userInfo?.name} />
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{userInfo?.name}</p>
                <p className="text-xs text-muted-foreground">{userInfo?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container py-6">
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{ngoData.name}</h1>
              <p className="text-muted-foreground">
                Wallet: {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500 text-white">{ngoData.status}</Badge>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{ngoData.score}/100</span>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${ngoData.totalRaised.toLocaleString()}</div>
                <Progress className="mt-2" value={(ngoData.totalRaised / ngoData.goal) * 100} />
                <p className="mt-2 text-xs text-muted-foreground">
                  ${ngoData.goal.toLocaleString()} goal
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Donors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ngoData.donors.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(Math.random() * 100)} this month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ngoData.campaigns}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 3)} active now
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Reports</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ngoData.reports}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.floor(Math.random() * 3)} pending review
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Tabs defaultValue="overview" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>NGO Performance</CardTitle>
                    <CardDescription>
                      Your organization's performance metrics and transparency score.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Verification</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-full rounded-full bg-green-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-medium">Impact</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[85%] rounded-full bg-blue-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">Responsiveness</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[90%] rounded-full bg-yellow-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <BarChart3 className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-medium">Transparency</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div className="h-full w-[95%] rounded-full bg-purple-500" />
                          </div>
                        </div>
                      </div>
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h3 className="mb-2 font-medium">Recent Activity</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2 text-sm">
                            <Upload className="mt-0.5 h-4 w-4 text-green-500" />
                            <div>
                              <p>Quarterly report uploaded</p>
                              <p className="text-xs text-muted-foreground">2 days ago</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <DollarSign className="mt-0.5 h-4 w-4 text-green-500" />
                            <div>
                              <p>Received donation of $5,000</p>
                              <p className="text-xs text-muted-foreground">5 days ago</p>
                            </div>
                          </li>
                          <li className="flex items-start gap-2 text-sm">
                            <Eye className="mt-0.5 h-4 w-4 text-blue-500" />
                            <div>
                              <p>Campaign "Education for Rural Areas" viewed 500+ times</p>
                              <p className="text-xs text-muted-foreground">1 week ago</p>
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="campaigns" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>
                      Manage your active and past fundraising campaigns.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button>
                        <Zap className="mr-2 h-4 w-4" />
                        Create New Campaign
                      </Button>
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4">
                          <div>
                            <h3 className="font-medium">Education for Rural Areas</h3>
                            <p className="text-sm text-muted-foreground">
                              Providing educational resources to underserved rural communities
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = "/ngo/management/campaigns"}
                          >
                            Manage
                          </Button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t p-4">
                          <div>
                            <h3 className="font-medium">Teacher Training Program</h3>
                            <p className="text-sm text-muted-foreground">
                              Professional development for educators in low-income schools
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">Active</Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = "/ngo/management/campaigns"}
                          >
                            Manage
                          </Button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t p-4">
                          <div>
                            <h3 className="font-medium">School Supplies Drive</h3>
                            <p className="text-sm text-muted-foreground">
                              Providing essential learning materials to students in need
                            </p>
                          </div>
                          <Badge variant="outline">Completed</Badge>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = "/ngo/management/campaigns"}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="reports" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Impact Reports</CardTitle>
                    <CardDescription>
                      Track and share the impact of your organization's work.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Report
                      </Button>
                      <div className="rounded-lg border">
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 p-4">
                          <div>
                            <h3 className="font-medium">Q2 2023 Financial Report</h3>
                            <p className="text-sm text-muted-foreground">
                              Detailed breakdown of donations and expenditures
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">Verified</Badge>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t p-4">
                          <div>
                            <h3 className="font-medium">Annual Impact Assessment</h3>
                            <p className="text-sm text-muted-foreground">
                              Comprehensive analysis of program outcomes and beneficiary feedback
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">Verified</Badge>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                        <div className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t p-4">
                          <div>
                            <h3 className="font-medium">Rural Education Initiative Results</h3>
                            <p className="text-sm text-muted-foreground">
                              Metrics and testimonials from our flagship program
                            </p>
                          </div>
                          <Badge variant="secondary">Pending</Badge>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>NGO Profile Settings</CardTitle>
                    <CardDescription>
                      Manage your organization's profile and account settings.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organization Name</label>
                          <input
                            type="text"
                            className="w-full rounded-md border px-3 py-2"
                            defaultValue={ngoData.name}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Email Address</label>
                          <input
                            type="email"
                            className="w-full rounded-md border px-3 py-2"
                            defaultValue={userInfo?.email}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Wallet Address</label>
                          <input
                            type="text"
                            className="w-full rounded-md border px-3 py-2"
                            defaultValue={walletAddress}
                            disabled
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Organization Type</label>
                          <select className="w-full rounded-md border px-3 py-2">
                            <option>Educational</option>
                            <option>Healthcare</option>
                            <option>Environmental</option>
                            <option>Humanitarian</option>
                            <option>Other</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Organization Description</label>
                        <textarea
                          className="h-32 w-full rounded-md border px-3 py-2"
                          defaultValue="Education for All Foundation is dedicated to providing quality education to underserved communities around the world. We focus on building schools, training teachers, and providing educational resources to ensure every child has access to learning opportunities."
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  )
}