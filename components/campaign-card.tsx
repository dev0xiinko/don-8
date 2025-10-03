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

interface CampaignCardProps {
  campaign: Campaign
  onReportUpload: (campaignId: string, file: File) => void
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
    if (selectedFile) {
      setIsUploading(true)
      onReportUpload(campaign.id, selectedFile)
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
      {campaign.image && (
        <div className="relative h-48 w-full overflow-hidden">
          <img src={campaign.image || "/placeholder.svg"} alt={campaign.name} className="h-full w-full object-cover" />
        </div>
      )}
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{campaign.name}</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <StatusIcon className="h-3 w-3" />
            {status.label}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">{campaign.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold">${campaign.amount.toLocaleString()}</span>
          <span className="text-sm text-muted-foreground">target</span>
        </div>

        <div className="text-sm text-muted-foreground">
          Created: {new Date(campaign.createdAt).toLocaleDateString()}
        </div>

        {campaign.reportUrl && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Report available</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-3">
        <div className="w-full space-y-2">
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
        <Button onClick={handleUpload} disabled={!selectedFile || isUploading} className="w-full gap-2">
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Upload Report"}
        </Button>
      </CardFooter>
    </Card>
  )
}
