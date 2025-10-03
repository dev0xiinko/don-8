"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Campaign } from "@/lib/mock-data"
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  Clock, 
  Eye, 
  Edit3, 
  MessageSquare, 
  TrendingUp,
  Users,
  Calendar,
  MapPin,
  Target
} from "lucide-react"
import { AddUpdateModal, CampaignUpdatesList } from "@/components/campaign-updates"
import { SafeImage } from "@/components/ui/safe-image"

interface NGOCampaignCardProps {
  campaign: Campaign
  onReportUpload?: (campaignId: string, file: File) => void
  onUpdateAdded?: (campaignId: string | number) => void
}

export function NGOCampaignCard({ campaign, onReportUpload, onUpdateAdded }: NGOCampaignCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile && onReportUpload) {
      setIsUploading(true)
      onReportUpload(campaign.id.toString(), selectedFile)
      setTimeout(() => {
        setIsUploading(false)
        setSelectedFile(null)
      }, 1000)
    }
  }

  const handleUpdateAdded = (update: any) => {
    if (onUpdateAdded) {
      onUpdateAdded(campaign.id)
    }
  }

  const statusConfig = {
    active: { label: "Active", icon: Clock, className: "bg-green-100 text-green-800" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-blue-100 text-blue-800" },
    pending: { label: "Pending", icon: Clock, className: "bg-yellow-100 text-yellow-800" },
  }

  const status = statusConfig[campaign.status] || statusConfig.active
  const StatusIcon = status.icon

  const progressPercentage = Math.min(
    ((campaign.raisedAmount || campaign.currentAmount || 0) / (campaign.targetAmount || 1)) * 100,
    100
  )

  const daysLeft = campaign.endDate 
    ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Campaign Image */}
        {((campaign.images && campaign.images.length > 0) || campaign.imageUrl || campaign.image) && (
          <div className="relative h-48 w-full overflow-hidden">
            <SafeImage
              src={
                (campaign.images && campaign.images.length > 0) 
                  ? campaign.images[0] 
                  : campaign.imageUrl || campaign.image
              } 
              alt={campaign.title || campaign.name || "Campaign"} 
              className="h-full w-full object-cover"
            />
            {campaign.featured && (
              <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                Featured
              </Badge>
            )}
            {campaign.urgencyLevel === 'urgent' && (
              <Badge className="absolute top-2 right-2 bg-red-600 text-white">
                Urgent
              </Badge>
            )}
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">
              {campaign.title || campaign.name}
            </CardTitle>
            <Badge className={status.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
          
          {campaign.category && (
            <Badge variant="outline" className="w-fit">
              {campaign.category}
            </Badge>
          )}
          
          <CardDescription className="line-clamp-2 text-sm leading-relaxed">
            {campaign.longDescription || campaign.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">
                {(campaign.raisedAmount || campaign.currentAmount || 0).toLocaleString()} SONIC
              </span>
              <span className="text-muted-foreground">
                of {(campaign.targetAmount || 0).toLocaleString()} SONIC
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{progressPercentage.toFixed(1)}% funded</span>
              <span>{campaign.donorCount || 0} donors</span>
            </div>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <div>
                <div className="text-muted-foreground">Created</div>
                <div className="font-medium">
                  {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            {daysLeft !== null && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-muted-foreground">Time left</div>
                  <div className="font-medium">
                    {daysLeft > 0 ? `${daysLeft} days` : 'Ended'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Location and Beneficiaries */}
          {(campaign.location || campaign.beneficiaries) && (
            <div className="grid grid-cols-1 gap-2 text-sm">
              {campaign.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{campaign.location}</span>
                </div>
              )}
              {campaign.beneficiaries && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{campaign.beneficiaries.toLocaleString()} people to help</span>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-4">
          <div className="w-full space-y-3">
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => setShowDetailsModal(true)}
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </Button>
              
              <AddUpdateModal 
                campaignId={campaign.id} 
                onUpdateAdded={handleUpdateAdded}
              />
            </div>

            {/* Report Upload Section */}
            {onReportUpload && (
              <div className="border-t pt-3 space-y-2">
                <Label htmlFor={`report-${campaign.id}`} className="text-sm font-medium">
                  Upload Progress Report
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`report-${campaign.id}`}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleUpload} 
                    disabled={!selectedFile || isUploading}
                    size="sm"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Campaign Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{campaign.title || campaign.name}</DialogTitle>
            <DialogDescription>
              Campaign details and updates
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="updates">
                Updates ({campaign.updates?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Campaign Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {campaign.longDescription || campaign.description}
                    </p>
                  </div>
                  
                  {campaign.tags && campaign.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {campaign.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="updates">
              <CampaignUpdatesList updates={campaign.updates || []} />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Funding
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {progressPercentage.toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {(campaign.raisedAmount || 0).toLocaleString()} of {(campaign.targetAmount || 0).toLocaleString()} SONIC
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Supporters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaign.donorCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Total donors</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaign.updates?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Updates posted</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}