"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  FileText,
  Mail,
  Phone,
  MapPin,
  Building2,
  Globe,
  Hash,
  CreditCard,
} from "lucide-react"

import type { NGOApplication } from "@/hooks/useAdmin"

interface ApplicationReviewModalProps {
  applicationId: string
  application: NGOApplication
  onClose: () => void
  onStatusUpdate: (applicationId: string, status: NGOApplication["status"], reviewNotes?: string) => Promise<boolean>
}

export function ApplicationReviewModal({
  applicationId,
  application,
  onClose,
  onStatusUpdate,
}: ApplicationReviewModalProps) {
  const [newStatus, setNewStatus] = useState<NGOApplication["status"]>(application.status)
  const [reviewNotes, setReviewNotes] = useState(application.reviewNotes || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [updateError, setUpdateError] = useState("")

  const handleStatusUpdate = async () => {
    if (newStatus === application.status && reviewNotes === (application.reviewNotes || "")) {
      onClose()
      return
    }

    setIsUpdating(true)
    setUpdateError("")

    try {
      const success = await onStatusUpdate(applicationId, newStatus, reviewNotes)
      if (success) {
        onClose()
      } else {
        setUpdateError("Failed to update application status. Please try again.")
      }
    } catch (error) {
      setUpdateError("An error occurred while updating the application.")
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusIcon = (status: NGOApplication["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "under_review":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: NGOApplication["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "under_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Building2 className="w-5 h-5" />
            <span>Review NGO Application</span>
          </DialogTitle>
          <DialogDescription>
            Review and manage the NGO registration application for {application.organizationName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getStatusIcon(application.status)}
              <span className="font-medium">Current Status:</span>
              <Badge className={getStatusColor(application.status)}>
                {application.status.replace("_", " ")}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Submitted: {new Date(application.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* Organization & Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Organization Information</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium">{application.organizationName}</div>
                    <div className="text-sm text-gray-600">Organization Name</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Mail className="w-4 h-4 mt-1 text-gray-500" />
                  <div>
                    <div className="font-medium">{application.email}</div>
                    <div className="text-sm text-gray-600">Email Address</div>
                  </div>
                </div>

                {application.website && (
                  <div className="flex items-start space-x-3">
                    <Globe className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <a
                        href={application.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                      >
                        <span>{application.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <div className="text-sm text-gray-600">Website</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Legal & Wallet</h3>
              <div className="space-y-3">
                {application.registrationNumber && (
                  <div className="flex items-start space-x-3">
                    <Hash className="w-4 h-4 mt-1 text-gray-500" />
                    <div>
                      <div className="font-medium">{application.registrationNumber}</div>
                      <div className="text-sm text-gray-600">Registration Number</div>
                    </div>
                  </div>
                )}

                

                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 mt-1 text-gray-500 font-mono text-xs">#</div>
                  <div>
                    <div className="font-mono text-sm">{application.walletAddress}</div>
                    <div className="text-sm text-gray-600">Wallet Address</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Organization Description</h3>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">{application.description}</p>
            </div>
          </div>

          {/* Category */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Category</h3>
            <Badge variant="secondary" className="text-sm">
              {application.category}
            </Badge>
          </div>

         

          {/* Social Media */}
          {application && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Social Media</h3>
              <div className="space-y-2">
                {application.facebook && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Facebook:</span>
                    <a
                      href={application.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>{application.facebook}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {application.twitter && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Twitter:</span>
                    <a
                      href={application.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                    >
                      <span>{application.twitter}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Review Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Review & Decision</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as NGOApplication["status"])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Review Notes</Label>
                <Textarea
                  id="notes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Add notes about your review decision..."
                  rows={4}
                />
              </div>

              {updateError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{updateError}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleStatusUpdate} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Updating...
              </>
            ) : (
              "Update Application"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
