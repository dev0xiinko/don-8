"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Calendar, Type, Image, MessageSquare } from "lucide-react"

interface CampaignUpdate {
  id: number
  title: string
  content: string
  images?: string[]
  createdAt: string
  type: "general" | "milestone" | "financial" | "emergency"
}

interface AddUpdateModalProps {
  campaignId: number | string
  onUpdateAdded: (update: CampaignUpdate) => void
}

export function AddUpdateModal({ campaignId, onUpdateAdded }: AddUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "general" as const,
    images: [] as string[]
  })

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/ngo/campaigns/${campaignId}/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()
      
      if (result.success) {
        onUpdateAdded(result.update)
        setFormData({ title: "", content: "", type: "general", images: [] })
        setIsOpen(false)
      } else {
        console.error('Failed to add update:', result.message)
      }
    } catch (error) {
      console.error('Error adding update:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateTypeConfig = {
    general: { label: "General Update", color: "bg-blue-100 text-blue-800", icon: MessageSquare },
    milestone: { label: "Milestone", color: "bg-green-100 text-green-800", icon: Type },
    financial: { label: "Financial Report", color: "bg-purple-100 text-purple-800", icon: Calendar },
    emergency: { label: "Urgent Update", color: "bg-red-100 text-red-800", icon: Plus }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Update
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Campaign Update</DialogTitle>
          <DialogDescription>
            Share progress, milestones, or important news with your donors
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Update Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Update Type</Label>
            <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(updateTypeConfig).map(([key, config]) => {
                  const IconComponent = config.icon
                  return (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {config.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Update Title</Label>
            <Input
              id="title"
              placeholder="e.g., First Water Well Completed"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Update Details</Label>
            <Textarea
              id="content"
              placeholder="Share detailed information about this update..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
            />
          </div>

          {/* Image Upload Placeholder */}
          <div className="space-y-2">
            <Label>Images (Optional)</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-sm text-gray-500">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Image upload feature coming soon
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.title.trim() || !formData.content.trim() || isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface CampaignUpdatesListProps {
  updates: CampaignUpdate[]
}

export function CampaignUpdatesList({ updates }: CampaignUpdatesListProps) {
  const updateTypeConfig = {
    general: { label: "General", color: "bg-blue-100 text-blue-800", icon: MessageSquare },
    milestone: { label: "Milestone", color: "bg-green-100 text-green-800", icon: Type },
    financial: { label: "Financial", color: "bg-purple-100 text-purple-800", icon: Calendar },
    emergency: { label: "Urgent", color: "bg-red-100 text-red-800", icon: Plus }
  }

  if (!updates || updates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No updates yet</p>
        <p className="text-sm">Share progress with your donors</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {updates.map((update) => {
        const config = updateTypeConfig[update.type]
        const IconComponent = config.icon
        
        return (
          <Card key={update.id} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">{update.title}</CardTitle>
                  <CardDescription className="text-xs">
                    {new Date(update.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </CardDescription>
                </div>
                <Badge className={config.color}>
                  <IconComponent className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 leading-relaxed">{update.content}</p>
              {update.images && update.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {update.images.slice(0, 3).map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Update ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                  {update.images.length > 3 && (
                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs">
                      +{update.images.length - 3}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}