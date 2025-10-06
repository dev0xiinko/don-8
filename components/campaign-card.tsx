"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Campaign } from "@/lib/mock-data"
import { FileText, Upload, CheckCircle2, Clock } from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import { NGOScoreMini } from "./ngo-score-mini"

interface CampaignCardProps {
  campaign: Campaign
  onReportUpload?: (campaignId: string, file: File) => void
  showActions?: boolean
}

export function CampaignCard({ campaign, onReportUpload }: CampaignCardProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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

  const statusConfig = {
    active: { label: "Active", icon: Clock, className: "bg-blue-500" },
    completed: { label: "Completed", icon: CheckCircle2, className: "bg-green-500" },
    pending: { label: "Pending", icon: Clock, className: "bg-yellow-500" },
  }

  const status = statusConfig[campaign.status]
  const StatusIcon = status.icon

  return (
    <Card className="flex flex-col overflow-hidden">
      {/* Campaign Images */}
      {((campaign.images && campaign.images.length > 0) || campaign.imageUrl || campaign.image) && (
        <div className="relative h-48 w-full overflow-hidden">
          <SafeImage
            campaign={campaign}
            alt={campaign.title || campaign.name || "Campaign"} 
            className="h-full w-full object-cover transition-transform hover:scale-105" 
          />
          {/* Image Count Indicator */}
          {campaign.images && campaign.images.length > 1 && (
            <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{campaign.images.length - 1} more
            </div>
          )}
          {/* Featured/Urgent Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {campaign.featured && (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                Featured
              </Badge>
            )}
            {campaign.urgencyLevel === 'urgent' && (
              <Badge className="bg-red-600 hover:bg-red-700 text-white text-xs">
                Urgent
              </Badge>
            )}
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg font-semibold line-clamp-2 leading-tight">{campaign.title || campaign.name}</CardTitle>
          <Badge variant="secondary" className="gap-1 shrink-0">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-3 text-sm leading-relaxed">
          {campaign.longDescription || campaign.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {/* NGO Information */}
        {campaign.ngoName && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-primary">{campaign.ngoName}</span>
              {campaign.location && (
                <>
                  <span>•</span>
                  <span>{campaign.location}</span>
                </>
              )}
            </div>
            {campaign.ngoId && (
              <NGOScoreMini 
                ngoId={campaign.ngoId} 
                ngoName={campaign.ngoName}
                className="w-fit"
              />
            )}
          </div>
        )}

        {/* Category Badge */}
        {campaign.category && (
          <div>
            <Badge variant="outline" className="text-xs">
              {campaign.category}
            </Badge>
          </div>
        )}

        {/* Funding Progress */}
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{(campaign.raisedAmount || campaign.currentAmount || 0).toLocaleString()} SONIC</span>
            <span className="text-sm text-muted-foreground">raised of {(campaign.targetAmount || campaign.amount || 0).toLocaleString()} SONIC</span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300" 
              style={{ 
                width: `${Math.min(((campaign.raisedAmount || campaign.currentAmount || 0) / (campaign.targetAmount || campaign.amount || 1)) * 100, 100)}%` 
              }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(((campaign.raisedAmount || campaign.currentAmount || 0) / (campaign.targetAmount || campaign.amount || 1)) * 100)}% funded</span>
            <span>{campaign.donorCount || 0} donors</span>
          </div>
        </div>

        {/* Campaign Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Created:</span>
            <br />
            <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
          </div>
          {campaign.endDate && (
            <div>
              <span className="text-muted-foreground">Ends:</span>
              <br />
              <span className="font-medium">{new Date(campaign.endDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Beneficiaries Count */}
        {campaign.beneficiaries && (
          <div className="text-sm">
            <span className="text-muted-foreground">Impact:</span>
            <span className="ml-2 font-medium">{campaign.beneficiaries.toLocaleString()} people helped</span>
          </div>
        )}

        {campaign.reportUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Report available</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-4">
        <div className="w-full space-y-3">
          {/* Campaign Tags */}
          {campaign.tags && campaign.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {campaign.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {campaign.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{campaign.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              Donate Now
            </Button>
            <Button variant="outline" size="sm">
              View Details
            </Button>
          </div>

          {/* Report Upload for NGO Management */}
          {onReportUpload && (
            <>
              <div className="w-full space-y-2 border-t pt-3">
                <Label htmlFor={`report-${campaign.id}`} className="text-sm">
                  Upload Campaign Report (PDF)
                </Label>
                <Input
                  id={`report-${campaign.id}`}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </div>
              <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full gap-2" variant="outline">
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload Report"}
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
