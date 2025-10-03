"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  MessageSquare, 
  Trophy, 
  DollarSign, 
  AlertTriangle,
  Calendar,
  Clock
} from "lucide-react"
import type { Campaign } from "@/lib/mock-data"

interface CampaignUpdate {
  id: number
  type: 'general' | 'milestone' | 'financial' | 'emergency'
  title: string
  content: string
  date: string
  createdAt: string
}

interface DonorCampaignUpdatesProps {
  campaign: Campaign
  className?: string
}

export function DonorCampaignUpdates({ campaign, className = "" }: DonorCampaignUpdatesProps) {
  const updates = (campaign.updates || []) as CampaignUpdate[]

  const getUpdateConfig = (type: string) => {
    switch (type) {
      case 'milestone':
        return {
          icon: Trophy,
          label: 'Milestone',
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'financial':
        return {
          icon: DollarSign,
          label: 'Financial Update',
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      case 'emergency':
        return {
          icon: AlertTriangle,
          label: 'Emergency',
          className: 'bg-red-100 text-red-800 border-red-200'
        }
      default:
        return {
          icon: MessageSquare,
          label: 'Update',
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffTime = Math.abs(now.getTime() - date.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays === 1) {
        return 'Yesterday'
      } else if (diffDays < 7) {
        return `${diffDays} days ago`
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
      }
    } catch (error) {
      return 'Recently'
    }
  }

  if (updates.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Campaign Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No updates yet</p>
            <p className="text-xs mt-1">
              The NGO will post updates about the campaign progress here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Campaign Updates
          </div>
          <Badge variant="outline" className="text-xs">
            {updates.length} update{updates.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-96 overflow-y-auto space-y-4">
          {updates.map((update) => {
            const config = getUpdateConfig(update.type)
            const UpdateIcon = config.icon

            return (
              <div key={update.id} className="border-l-2 border-muted pl-4 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge className={config.className}>
                    <UpdateIcon className="w-3 h-3 mr-1" />
                    {config.label}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(update.date || update.createdAt)}
                  </div>
                </div>
                
                <h4 className="font-medium text-sm mb-2 line-clamp-2">
                  {update.title}
                </h4>
                
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {update.content}
                </p>
              </div>
            )
          })}
        </div>
        
        {updates.length > 3 && (
          <div className="pt-3 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View All Updates ({updates.length})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}