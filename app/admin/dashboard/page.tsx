"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, CheckCircle, XCircle, Filter, Search, Shield, LogOut } from "lucide-react"
import { useAdmin } from "@/hooks/useAdmin"
import { ApplicationReviewModal } from "@/components/admin/application-review-modal"
import type { NGOApplication } from "@/hooks/useAdmin"

export default function AdminDashboard() {
  const router = useRouter()
  const {
    applications,
    isLoading,
    updateApplicationStatus,
  } = useAdmin()

  const [selectedApplication, setSelectedApplication] = useState<NGOApplication | null>(null)
  const [isApplicationModalOpen, setIsApplicationModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [adminInfo, setAdminInfo] = useState<any>(null)

  useEffect(() => {
    const session = localStorage.getItem("admin_session")
    if (session) {
      setAdminInfo(JSON.parse(session))
    } else {
      router.push("/admin/login")
    }
  }, [router])

  const handleReviewApplication = (application: NGOApplication) => {
    setSelectedApplication(application)
    setIsApplicationModalOpen(true)
  }

  const handleApproveApplication = async (applicationId: string, notes?: string) => {
    return await updateApplicationStatus(applicationId, "approved", notes)
  }

  const handleRejectApplication = async (applicationId: string, notes?: string) => {
    return await updateApplicationStatus(applicationId, "rejected", notes)
  }

  const handleLogout = () => {
    localStorage.removeItem("admin_session")
    document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    router.push("/admin/login")
  }

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
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || app.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">Review and manage NGO registration applications</p>
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
                        <div className="flex flex-col space-y-2 items-end">
                          <Button size="sm" onClick={() => handleReviewApplication(application)}>
                            <Eye className="w-3 h-3 mr-1" />
                            Review
                          </Button>
                          {application.status === "pending" && (
                            <div className="flex space-x-1 mt-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600 border-green-600 hover:bg-green-50 bg-transparent"
                                onClick={() => handleApproveApplication(application.id)}
                                title="Approve"
                              >
                                <CheckCircle className="w-3 h-3" />
                                <span className="ml-1">Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
                                onClick={() => handleRejectApplication(application.id)}
                                title="Reject"
                              >
                                <XCircle className="w-3 h-3" />
                                <span className="ml-1">Reject</span>
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

        {isApplicationModalOpen && selectedApplication && (
          <ApplicationReviewModal
            application={selectedApplication}
            applicationId={selectedApplication.id}
            onStatusUpdate={updateApplicationStatus}
            onClose={() => setIsApplicationModalOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
