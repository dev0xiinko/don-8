"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  MapPin,
  ExternalLink,
  Download,
  Eye,
  ImageIcon,
  Video,
  Award,
  Shield,
} from "lucide-react"
import type { NGOReport } from "@/hooks/useNGOReports"

interface ReportReviewModalProps {
  report: NGOReport | null
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: (reportId: string, status: NGOReport["status"], reviewNotes?: string) => Promise<boolean>
}

export function ReportReviewModal({ report, isOpen, onClose, onStatusUpdate }: ReportReviewModalProps) {
  const [newStatus, setNewStatus] = useState<NGOReport["status"]>("pending")
  const [reviewNotes, setReviewNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")

  if (!report) return null

  const handleStatusUpdate = async () => {
    if (!reviewNotes.trim() && newStatus === "rejected") {
      setError("Please provide review notes for rejection")
      return
    }

    setIsUpdating(true)
    setError("")

    try {
      const success = await onStatusUpdate(report.id, newStatus, reviewNotes)
      if (success) {
        onClose()
        setReviewNotes("")
      } else {
        setError("Failed to update report status. Please try again.")
      }
    } catch (error) {
      setError("An error occurred. Please try again.")
    } finally {
      setIsUpdating(false)
    }
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
      case "revision_requested":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "under_review":
        return <AlertCircle className="w-4 h-4" />
      case "revision_requested":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "financial":
        return <DollarSign className="w-5 h-5" />
      case "impact":
        return <TrendingUp className="w-5 h-5" />
      case "activity":
        return <Activity className="w-5 h-5" />
      case "annual":
        return <FileText className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {getReportTypeIcon(report.reportType)}
            <span>NGO Report Review</span>
          </DialogTitle>
          <DialogDescription>Review and approve or reject this NGO report from {report.ngoName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{report.title}</CardTitle>
                  <CardDescription className="mt-2">{report.description}</CardDescription>
                </div>
                <div className="text-right space-y-2">
                  <Badge className={`${getStatusColor(report.status)} border`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(report.status)}
                      <span className="capitalize">{report.status.replace("_", " ")}</span>
                    </div>
                  </Badge>
                  <div className="text-sm text-gray-600">
                    <Badge variant="outline" className="capitalize">
                      {report.reportType} Report
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Reporting Period</div>
                    <div className="text-sm text-gray-600">
                      {new Date(report.reportingPeriod.startDate).toLocaleDateString()} -{" "}
                      {new Date(report.reportingPeriod.endDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Submitted</div>
                    <div className="text-sm text-gray-600">{new Date(report.submittedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <div>
                    <div className="text-sm font-medium">Organization</div>
                    <div className="text-sm text-gray-600">{report.ngoName}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial" disabled={!report.financialData}>
                Financial
              </TabsTrigger>
              <TabsTrigger value="impact" disabled={!report.impactData}>
                Impact
              </TabsTrigger>
              <TabsTrigger value="activities" disabled={!report.activityData}>
                Activities
              </TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {report.impactData && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <div>
                          <div className="text-2xl font-bold">
                            {report.impactData.beneficiariesReached.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Beneficiaries Reached</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {report.impactData && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-green-600" />
                        <div>
                          <div className="text-2xl font-bold">{report.impactData.programsCompleted}</div>
                          <div className="text-sm text-gray-600">Programs Completed</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {report.financialData && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <div>
                          <div className="text-2xl font-bold">{report.financialData.totalSpent} ETH</div>
                          <div className="text-sm text-gray-600">Total Spent</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <div>
                        <div className="text-2xl font-bold">{report.documents.length}</div>
                        <div className="text-sm text-gray-600">Documents</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Compliance Status */}
              {report.compliance && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Compliance Status</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-sm font-medium">Regulatory Compliance:</span>
                          <Badge variant={report.compliance.regulatoryCompliance ? "default" : "destructive"}>
                            {report.compliance.regulatoryCompliance ? "Compliant" : "Non-Compliant"}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Audit Status:</span>
                          <Badge variant="outline" className="capitalize">
                            {report.compliance.auditStatus.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium mb-2">Certifications & Licenses:</div>
                        <div className="space-y-1">
                          {report.compliance.certifications.map((cert, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Award className="w-3 h-3 text-yellow-600" />
                              <span className="text-sm">{cert}</span>
                            </div>
                          ))}
                          {report.compliance.licenses.map((license, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Shield className="w-3 h-3 text-blue-600" />
                              <span className="text-sm">{license}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Financial Tab */}
            <TabsContent value="financial" className="space-y-4">
              {report.financialData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {report.financialData.totalReceived} ETH
                          </div>
                          <div className="text-sm text-gray-600">Total Received</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{report.financialData.totalSpent} ETH</div>
                          <div className="text-sm text-gray-600">Total Spent</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {report.financialData.remainingBalance} ETH
                          </div>
                          <div className="text-sm text-gray-600">Remaining Balance</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Expenses */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Expenses Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {report.financialData.expenses.map((expense, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <div className="font-medium">{expense.category}</div>
                                  <div className="text-sm text-gray-600">{expense.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{expense.amount} ETH</div>
                                  <div className="text-sm text-gray-500">
                                    {new Date(expense.date).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              {expense.receipts && expense.receipts.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {expense.receipts.map((receipt, receiptIndex) => (
                                    <Button
                                      key={receiptIndex}
                                      variant="outline"
                                      size="sm"
                                      className="text-xs bg-transparent"
                                    >
                                      <FileText className="w-3 h-3 mr-1" />
                                      {receipt}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Funding Sources */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Funding Sources</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {report.financialData.fundingSources.map((source, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium">{source.source}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(source.date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="font-bold">{source.amount} ETH</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Impact Tab */}
            <TabsContent value="impact" className="space-y-4">
              {report.impactData && (
                <>
                  {/* Goals Achievement */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Goals Achievement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {report.impactData.goalsAchieved.map((goal, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <div className="font-medium">{goal.goal}</div>
                                <div className="text-sm text-gray-600 mt-1">{goal.description}</div>
                              </div>
                              <Badge
                                variant={
                                  goal.status === "completed"
                                    ? "default"
                                    : goal.status === "in_progress"
                                      ? "secondary"
                                      : "outline"
                                }
                              >
                                {goal.status.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="mt-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>{goal.progress}%</span>
                              </div>
                              <Progress value={goal.progress} className="h-2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Impact Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Impact Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {report.impactData.metrics.map((metric, index) => (
                          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{metric.value}</div>
                            <div className="text-sm font-medium">{metric.metric}</div>
                            <div className="text-xs text-gray-600">{metric.unit}</div>
                            {metric.comparison && (
                              <div className="text-xs text-green-600 mt-1">{metric.comparison}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities" className="space-y-4">
              {report.activityData && (
                <>
                  {/* Completed Activities */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Activities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {report.activityData.activitiesCompleted.map((activity, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-medium">{activity.name}</div>
                                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="w-3 h-3" />
                                    <span>{new Date(activity.date).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-3 h-3" />
                                    <span>{activity.location}</span>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Users className="w-3 h-3" />
                                    <span>{activity.participants} participants</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 mb-2">{activity.description}</div>
                            <div className="text-sm">
                              <span className="font-medium">Outcomes: </span>
                              <span className="text-gray-600">{activity.outcomes}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Upcoming Activities */}
                  {report.activityData.upcomingActivities.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Upcoming Activities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {report.activityData.upcomingActivities.map((activity, index) => (
                            <div key={index} className="border rounded-lg p-4 bg-blue-50">
                              <div className="font-medium">{activity.name}</div>
                              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{new Date(activity.plannedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{activity.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="w-3 h-3" />
                                  <span>{activity.expectedParticipants} expected</span>
                                </div>
                              </div>
                              <div className="text-sm text-gray-700 mt-2">{activity.description}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Documents */}
                <Card>
                  <CardHeader>
                    <CardTitle>Supporting Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <div>
                              <div className="font-medium text-sm">{doc.name}</div>
                              <div className="text-xs text-gray-600 capitalize">{doc.type}</div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" className="bg-transparent">
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Media */}
                {report.media && report.media.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Media Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {report.media.map((media, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="flex items-center space-x-3 mb-2">
                              {media.type === "image" ? (
                                <ImageIcon className="w-4 h-4 text-blue-500" />
                              ) : (
                                <Video className="w-4 h-4 text-red-500" />
                              )}
                              <div className="flex-1">
                                <div className="text-sm font-medium capitalize">{media.type}</div>
                                <div className="text-xs text-gray-600">{media.caption}</div>
                              </div>
                              <Button variant="outline" size="sm" className="bg-transparent">
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Previous Review */}
          {report.reviewedAt && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Review</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="font-medium">Reviewed by:</span>
                    <span>{report.reviewedBy}</span>
                    <span className="text-gray-500">on {new Date(report.reviewedAt).toLocaleDateString()}</span>
                  </div>
                  {report.reviewNotes && (
                    <div>
                      <span className="text-sm font-medium">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">{report.reviewNotes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Review Section */}
          <Card>
            <CardHeader>
              <CardTitle>Review & Decision</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Update Status</Label>
                  <Select value={newStatus} onValueChange={(value) => setNewStatus(value as NGOReport["status"])}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="revision_requested">Request Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    placeholder="Add your review comments, feedback, or reasons for your decision..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button variant="outline" onClick={onClose} disabled={isUpdating} className="bg-transparent">
                    Cancel
                  </Button>
                  <Button onClick={handleStatusUpdate} disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
                      </>
                    ) : (
                      "Update Report Status"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
