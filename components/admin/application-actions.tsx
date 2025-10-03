"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, 
  XCircle, 
  Clock,
  Eye,
  AlertTriangle,
  ExternalLink
} from "lucide-react"
import type { NGOApplication } from "@/hooks/useAdmin"

interface ApplicationActionsProps {
  application: NGOApplication
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onReview: (application: NGOApplication) => void
}

export function ApplicationActions({ 
  application, 
  onApprove, 
  onReject, 
  onReview 
}: ApplicationActionsProps) {
  const [isLoading, setIsLoading] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case "under_review":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await onApprove(application.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      await onReject(application.id)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {getStatusBadge(application.status)}
      
      <div className="flex gap-1 ml-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onReview(application)}
          className="h-8 px-2"
        >
          <Eye className="w-3 h-3 mr-1" />
          Review
        </Button>

        {application.status === "pending" && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleApprove}
              disabled={isLoading}
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline" 
              size="sm"
              onClick={handleReject}
              disabled={isLoading}
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </>
        )}

        {application.website && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(application.website, '_blank')}
            className="h-8 px-2"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  )
}