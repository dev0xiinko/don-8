"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Users,
  Building,
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Settings,
  LogOut,
  Shield,
  UserCheck,
  UserX,
  Activity,
  FileText,
  BarChart3,
} from "lucide-react"
import { useAdmin } from "@/hooks/useAdmin"
import { useNGOReports } from "@/hooks/useNGOReports"
import { ApplicationReviewModal } from "@/components/admin/application-review-modal"
import { ReportReviewModal } from "@/components/admin/report-review-modal"
import type { NGOApplication } from "@/hooks/useAdmin"
import type { NGOReport } from "@/hooks/useNGOReports"

export default function AdminDashboard() {
  const router = useRouter()
  const {
    applications,
    users,
    stats,
    activities,
    isLoading: adminLoading,
    updateApplicationStatus,
    updateUserStatus,
    getApplicationsByStatus,
    getUsersByType,
    refreshData: refreshAdminData,
  } = useAdmin()

  const {
    reports,
    isLoading: reportsLoading,
    updateReportStatus,
    getReportsByStatus,
    getReportsByType,
    refreshReports,
  } = useNGOReports()

  const [activeTab, setActiveTab] = useState("overview")
  const [selectedApplication, setSelectedApplication] = useState<NGOApplication | null>(null)
  const [selectedReport, setSelectedReport] = useState<NGOReport | null>(null)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [userTypeFilter, setUserTypeFilter] = useState("all")
  const [reportTypeFilter, setReportTypeFilter] = useState("all")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [adminInfo, setAdminInfo] = useState<any>(null)

  const isLoading = adminLoading || reportsLoading

  useEffect(() => {
    // Check admin session
    const session = localStorage.getItem("admin_session")
    if (session) {
      setAdminInfo(JSON.parse(session))
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refreshAdminData(), refreshReports()])
    setIsRefreshing(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/admin/login")
  }

  const handleReviewApplication = (application: NGOApplication) => {
    setSelectedApplication(application)
    setIsApplicationModalOpen(true)
  }

  const handleReviewReport = (report: NGOReport) => {
    setSelectedReport(report)
    setIsReportModalOpen(true)
  }

  const handleApproveApplication = async (applicationId: string, notes?: string) => {
    return await updateApplicationStatus(applicationId, "approved", notes)
  }

  const handleRejectApplication = async (applicationId: string, notes?: string) => {
    return await updateApplicationStatus(applicationId, "rejected", notes)
  }

  const handleRequestReview = async (applicationId: string, notes?: string) => {
    return await updateApplicationStatus(applicationId, "under_review", notes)
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.address.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = userTypeFilter === "all" || user.userType === userTypeFilter
    return matchesSearch && matchesType
  })

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.ngoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    const matchesType = reportTypeFilter === "all" || report.reportType === reportTypeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "revision_requested":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "banned":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <DollarSign className="w-4 h-4" />
      case "impact":
        return <TrendingUp className="w-4 h-4" />
      case "activity":
        return <Activity className="w-4 h-4" />
      case "annual":
        return <BarChart3 className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
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
            <Badge variant="secondary" className="bg-red-100 text-red-800">
              <Shield className="w-3 h-3 mr-1" />
              Admin Panel
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {adminInfo?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage NGO applications, reports, users, and platform operations</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{stats?.activeUsers24h} active in 24h</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total NGOs</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalNGOs}</div>
                  <p className="text-xs text-muted-foreground">{stats?.pendingApplications} pending approval</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalVolume} ETH</div>
                  <p className="text-xs text-muted-foreground">{stats?.transactionsToday} transactions today</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Donation</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.averageDonation} ETH</div>
                  <p className="text-xs text-muted-foreground">{stats?.totalDonations} total donations</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{getReportsByStatus("pending").length}</div>
                  <p className="text-xs text-muted-foreground">{reports.length} total reports</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="applications">NGO Applications</TabsTrigger>
            <TabsTrigger value="reports">NGO Reports</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Applications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2 text-yellow-600" />
                    Pending Applications
                  </CardTitle>
                  <CardDescription>NGO applications awaiting review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        ))
                      : getApplicationsByStatus("pending")
                          .slice(0, 5)
                          .map((app) => (
                            <div key={app.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{app.organizationName}</p>
                                <p className="text-xs text-gray-500">
                                  {app.location} • {app.category}
                                </p>
                              </div>
                              <Button size="sm" onClick={() => handleReviewApplication(app)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                            </div>
                          ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => setActiveTab("applications")}
                  >
                    View All Applications
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Reports */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Pending Reports
                  </CardTitle>
                  <CardDescription>NGO reports awaiting review</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                            <Skeleton className="h-8 w-16" />
                          </div>
                        ))
                      : getReportsByStatus("pending")
                          .slice(0, 5)
                          .map((report) => (
                            <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-2">
                                {getReportTypeIcon(report.reportType)}
                                <div>
                                  <p className="font-medium text-sm">{report.title}</p>
                                  <p className="text-xs text-gray-500">
                                    {report.ngoName} • {report.reportType}
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => handleReviewReport(report)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                            </div>
                          ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full mt-4 bg-transparent"
                    onClick={() => setActiveTab("reports")}
                  >
                    View All Reports
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest admin actions and system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">No recent activity</p>
                    </div>
                  ) : (
                    activities.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.details}</p>
                          <p className="text-xs text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Top Categories by Volume</CardTitle>
                <CardDescription>Most popular NGO categories by donation volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex items-center space-x-4 flex-1 mx-4">
                            <Skeleton className="h-2 flex-1" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      ))
                    : stats?.topCategories.map((category, index) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium w-4">{index + 1}</span>
                            <span className="text-sm">{category.category}</span>
                          </div>
                          <div className="flex items-center space-x-4 flex-1 max-w-xs">
                            <Progress value={(category.count / 50) * 100} className="flex-1" />
                            <span className="text-sm font-medium">{category.volume} ETH</span>
                          </div>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NGO Applications</CardTitle>
                <CardDescription>Review and manage NGO registration applications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
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

                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-64" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No applications found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredApplications.map((application) => (
                      <Card key={application.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold">{application.organizationName}</h3>
                                <Badge className={`${getStatusColor(application.status)} border text-xs`}>
                                  {application.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {application.category}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{application.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{application.location}</span>
                                <span>•</span>
                                <span>{application.email}</span>
                                <span>•</span>
                                <span>Submitted {new Date(application.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button size="sm" onClick={() => handleReviewApplication(application)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                              {application.status === "pending" && (
                                <div className="flex space-x-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                                    onClick={() => handleApproveApplication(application.id)}
                                  >
                                    <CheckCircle className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                    onClick={() => handleRejectApplication(application.id)}
                                  >
                                    <XCircle className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>NGO Reports</CardTitle>
                <CardDescription>Review and manage NGO activity, financial, and impact reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="impact">Impact</SelectItem>
                      <SelectItem value="activity">Activity</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="revision_requested">Revision Requested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-2 flex-1">
                              <Skeleton className="h-5 w-48" />
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-64" />
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-20" />
                              <Skeleton className="h-8 w-16" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredReports.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No reports found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <Card key={report.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <div className="flex items-center space-x-2">
                                  {getReportTypeIcon(report.reportType)}
                                  <h3 className="font-semibold">{report.title}</h3>
                                </div>
                                <Badge className={`${getStatusColor(report.status)} border text-xs`}>
                                  {report.status.replace("_", " ")}
                                </Badge>
                                <Badge variant="outline" className="text-xs capitalize">
                                  {report.reportType}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span>{report.ngoName}</span>
                                <span>•</span>
                                <span>
                                  {new Date(report.reportingPeriod.startDate).toLocaleDateString()} -{" "}
                                  {new Date(report.reportingPeriod.endDate).toLocaleDateString()}
                                </span>
                                <span>•</span>
                                <span>Submitted {new Date(report.submittedAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex flex-col space-y-2">
                              <Button size="sm" onClick={() => handleReviewReport(report)}>
                                <Eye className="w-3 h-3 mr-1" />
                                Review
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage platform users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users by address..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="donor">Donors</SelectItem>
                      <SelectItem value="ngo">NGOs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-24" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Skeleton className="h-6 w-16" />
                              <Skeleton className="h-8 w-20" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No users found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredUsers.map((user) => (
                      <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback>{user.userType === "donor" ? "D" : "N"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm">
                                    {user.address.substring(0, 6)}...{user.address.substring(38)}
                                  </span>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {user.userType}
                                  </Badge>
                                  <Badge className={`${getStatusColor(user.status)} border text-xs`}>
                                    {user.status}
                                  </Badge>
                                </div>
                                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                                  <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span>Last active {new Date(user.lastActive).toLocaleDateString()}</span>
                                  {user.totalDonated && (
                                    <>
                                      <span>•</span>
                                      <span>Donated {user.totalDonated} ETH</span>
                                    </>
                                  )}
                                  {user.totalReceived && (
                                    <>
                                      <span>•</span>
                                      <span>Received {user.totalReceived} ETH</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              {user.status === "active" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-yellow-600 border-yellow-600 hover:bg-yellow-50 bg-transparent"
                                  onClick={() => updateUserStatus(user.id, "suspended")}
                                >
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  Suspend
                                </Button>
                              )}
                              {user.status === "suspended" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                                  onClick={() => updateUserStatus(user.id, "active")}
                                >
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Activate
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                onClick={() => updateUserStatus(user.id, "banned")}
                              >
                                <UserX className="w-3 h-3 mr-1" />
                                Ban
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                  <CardDescription>User registration and activity trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Donation Volume</CardTitle>
                  <CardDescription>Monthly donation volume and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Chart visualization would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>NGO Categories</CardTitle>
                  <CardDescription>Distribution of NGOs by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">Pie chart would go here</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>NGOs and donors by location</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <p className="text-gray-500">World map would go here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

{isApplicationModalOpen && selectedApplication && (
  <ApplicationReviewModal
    application={selectedApplication}
    applicationId={selectedApplication.id}
    onStatusUpdate={updateApplicationStatus}
    onClose={() => setIsApplicationModalOpen(false)}
  />
)}

      {/* Report Review Modal */}
      <ReportReviewModal
        report={selectedReport}
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onStatusUpdate={updateReportStatus}
      />
    </div>
  )
}
