"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Eye,
  UserCheck,
  UserX,
  Shield,
  LogOut,
  RefreshCw,
} from "lucide-react"
import { useAdmin } from "@/hooks/useAdmin"
import { ApplicationReviewModal } from "@/components/admin/application-review-modal"

export default function AdminDashboard() {
  const router = useRouter()
  const {
    applications,
    users,
    stats,
    activities,
    isLoading,
    updateApplicationStatus,
    updateUserStatus,
    getApplicationsByStatus,
    getUsersByType,
    refreshData,
  } = useAdmin()

  const [selectedApplication, setSelectedApplication] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all")
  const [adminInfo, setAdminInfo] = useState<any>(null)

  useEffect(() => {
    // Check admin session
    const session = localStorage.getItem("admin_session")
    if (session) {
      setAdminInfo(JSON.parse(session))
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem("admin_session")
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/admin/login")
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.address.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = userTypeFilter === "all" || user.userType === userTypeFilter
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <Shield className="text-white w-4 h-4" />
                </div>
                <h1 className="text-2xl font-bold">DON-8 Admin</h1>
              </div>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                Administrator
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {adminInfo?.email}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshData}
                className="flex items-center space-x-2 bg-transparent"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{stats?.activeUsers24h} active in 24h</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalNGOs}</div>
              <p className="text-xs text-muted-foreground">{stats?.pendingApplications} pending applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalVolume} ETH</div>
              <p className="text-xs text-muted-foreground">{stats?.transactionsToday} transactions today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.averageDonation} ETH</div>
              <p className="text-xs text-muted-foreground">{stats?.totalDonations} total donations</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="applications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="applications">NGO Applications</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* NGO Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>NGO Applications</CardTitle>
                    <CardDescription>Review and manage NGO registration applications</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search applications..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="under_review">Under Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.organizationName}</div>
                            <div className="text-sm text-gray-500">{application.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{application.category}</TableCell>
                        <TableCell>{application.location}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "rejected"
                                  ? "destructive"
                                  : application.status === "under_review"
                                    ? "secondary"
                                    : "outline"
                            }
                          >
                            {application.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {application.status === "approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {application.status === "rejected" && <XCircle className="w-3 h-3 mr-1" />}
                            {application.status === "under_review" && <AlertCircle className="w-3 h-3 mr-1" />}
                            {application.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(application.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" onClick={() => setSelectedApplication(application.id)}>
                            <Eye className="w-4 h-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* User Management Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage platform users and their permissions</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="donor">Donors</SelectItem>
                        <SelectItem value="ngo">NGOs</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Wallet</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="font-mono text-sm">
                            {user.address.slice(0, 6)}...{user.address.slice(-4)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.userType === "donor" ? "default" : "secondary"}>{user.userType}</Badge>
                        </TableCell>
                        <TableCell>{user.walletType}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "suspended"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.joinedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {user.status === "active" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateUserStatus(user.id, "suspended")}
                              >
                                <UserX className="w-4 h-4 mr-1" />
                                Suspend
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" onClick={() => updateUserStatus(user.id, "active")}>
                                <UserCheck className="w-4 h-4 mr-1" />
                                Activate
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Categories</CardTitle>
                  <CardDescription>NGO categories by volume</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.topCategories.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-medium text-red-600">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{category.category}</div>
                            <div className="text-sm text-gray-500">{category.count} NGOs</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{category.volume} ETH</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Health</CardTitle>
                  <CardDescription>Key platform metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Active Users (24h)</span>
                      <span className="text-sm">{stats?.activeUsers24h}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Transactions Today</span>
                      <span className="text-sm">{stats?.transactionsToday}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Pending Applications</span>
                      <span className="text-sm">{stats?.pendingApplications}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Average Donation</span>
                      <span className="text-sm">{stats?.averageDonation} ETH</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Application Review Modal */}
      {selectedApplication && (
        <ApplicationReviewModal
          applicationId={selectedApplication}
          application={applications.find((app) => app.id === selectedApplication)!}
          onClose={() => setSelectedApplication(null)}
          onStatusUpdate={updateApplicationStatus}
        />
      )}
    </div>
  )
}
