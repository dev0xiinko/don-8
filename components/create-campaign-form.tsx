"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Campaign } from "@/lib/mock-data"
import { PlusCircle, ImageIcon, X } from "lucide-react"

interface CreateCampaignFormProps {
  onCampaignCreate: (campaign: Omit<Campaign, "id" | "createdAt" | "status">) => void
}

export function CreateCampaignForm({ onCampaignCreate }: CreateCampaignFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !description || !amount) {
      alert("Please fill in all fields")
      return
    }

    onCampaignCreate({
      name,
      description,
      amount: Number.parseFloat(amount),
      image: imagePreview || undefined,
    })

    // Reset form
    setName("")
    setDescription("")
    setAmount("")
    setImageFile(null)
    setImagePreview(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Campaign</CardTitle>
        <CardDescription>Launch a new fundraising campaign for your NGO initiatives</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name</Label>
            <Input
              id="name"
              placeholder="Enter campaign name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign goals and impact"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Target Amount (USD)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Campaign Image</Label>
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Campaign preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                <Label htmlFor="image" className="flex flex-col items-center gap-2 cursor-pointer">
                  <ImageIcon className="h-10 w-10 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Click to upload campaign image</span>
                  <span className="text-xs text-muted-foreground">PNG, JPG, GIF up to 10MB</span>
                </Label>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Campaign
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
