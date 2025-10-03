"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  TrendingUp
} from "lucide-react"
import type { NGOApplication } from "@/hooks/useAdmin"

interface DashboardStatsProps {
  applications: NGOApplication[]
}

export function DashboardStats({ applications }: DashboardStatsProps) {
  const totalApplications = applications.length
  const pendingApplications = applications.filter(app => app.status === "pending").length
  const approvedApplications = applications.filter(app => app.status === "approved").length
  const rejectedApplications = applications.filter(app => app.status === "rejected").length
  const underReviewApplications = applications.filter(app => app.status === "under_review").length

  const approvalRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0

  const stats = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Review",
      value: pendingApplications,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Approved",
      value: approvedApplications,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Rejected",
      value: rejectedApplications,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Under Review",
      value: underReviewApplications,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Approval Rate",
      value: `${approvalRate}%`,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div className={`w-10 h-10 ${stat.bgColor} rounded-full flex items-center justify-center`}>
                  <IconComponent className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export function QuickActions({ 
  onRefresh, 
  isLoading 
}: { 
  onRefresh: () => void
  isLoading: boolean 
}) {
  return (
    <div className="flex gap-2 mb-4">
      <Badge 
        variant="secondary" 
        className="cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onRefresh}
      >
        {isLoading ? "Refreshing..." : "Refresh Data"}
      </Badge>
    </div>
  )
}