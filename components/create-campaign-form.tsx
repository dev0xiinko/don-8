// components/create-campaign-form.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { storeImageBlob } from "@/lib/blob-storage";

interface Campaign {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  endDate: string;
  urgent: boolean;
  donorCount: number;
  imageUrl?: string;
}

interface CreateCampaignFormProps {
  onCampaignCreate: (campaignData: Omit<Campaign, "id" | "createdAt" | "status">) => void;
}

export function CreateCampaignForm({ onCampaignCreate }: CreateCampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const [urgent, setUrgent] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async () => {
    if (!name || !description || !targetAmount || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

  // Handle image - ensure proper storage for homepage access
  // Use stable data URL (base64) or a remote URL, avoid ephemeral blob: URLs and localStorage-only keys
  let finalImageUrl = "";
  let blobImages: string[] = [];
    
    try {
      if (imageFile) {
        // Convert file to base64 for reliable storage across sessions and devices
        const base64String = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(imageFile);
        });

        // Optionally keep a localStorage backup, but prefer embedding the base64 directly
        try {
          const imageKey = `campaign_image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(imageKey, base64String);
          // Keep both for compatibility; base64 will be preferred by image utils
          blobImages = [base64String, imageKey];
        } catch (lsError) {
          blobImages = [base64String];
        }

        // Use the base64 as the canonical image URL
        finalImageUrl = base64String;

        // Avoid relying on blob: URLs which are session-scoped and can break on reload
        try {
          storeImageBlob(imageFile);
        } catch (blobError) {
          console.warn('Blob storage backup failed (safe to ignore):', blobError);
        }

      } else if (imageUrl) {
        // For URL images, validate first
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Invalid image URL'));
          img.src = imageUrl;
        });
        // Use direct URL for immediate access and cross-device persistence
        finalImageUrl = imageUrl;
        blobImages = [imageUrl];
        // Optional: keep a localStorage reference as a fallback
        try {
          const imageKey = `campaign_image_url_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem(imageKey, imageUrl);
          blobImages.push(imageKey);
        } catch {}
      }
    } catch (error) {
      console.error('Error processing image:', error);
      // Fallback handling
      if (imageFile) {
        // As a last resort, fall back to a temporary blob URL (may not persist across reloads)
        finalImageUrl = URL.createObjectURL(imageFile);
        blobImages = [finalImageUrl];
      } else if (imageUrl) {
        finalImageUrl = imageUrl;
        blobImages = [imageUrl];
      }
    }

    const campaignData = {
      name, // Keep original name field for type compatibility
      title: name, // Also add title for API consistency
      description,
      longDescription: description, // Set both for compatibility
      targetAmount: parseFloat(targetAmount),
      raisedAmount: 0,
      currentAmount: 0,
      endDate,
      urgent, // Keep original urgent field
      urgencyLevel: urgent ? "urgent" : "normal",
      donorCount: 0,
  imageUrl: finalImageUrl,
  image: finalImageUrl, // Ensure both fields are set for compatibility
  images: blobImages, // Prefer base64 or remote URL entries first
      category: "Emergency Relief", // Default category
      location: "Philippines", // Default location
      beneficiaries: 0,
      tags: urgent ? ["urgent", "emergency"] : [],
      // Add metadata for image handling
      imageType: imageFile ? 'file' : imageUrl ? 'url' : 'none',
      imageStorageKeys: blobImages,
    };

    console.log('Campaign data created:', {
      ...campaignData,
      imageUrl: finalImageUrl,
      imageStorageKeys: blobImages
    });

    // Ensure the image is properly accessible
    if (finalImageUrl) {
      console.log('Image stored successfully:', {
        imageUrl: finalImageUrl,
        isLocalStorageKey: finalImageUrl.startsWith('campaign_image_'),
        isURL: finalImageUrl.startsWith('http') || finalImageUrl.startsWith('/'),
        isBase64: finalImageUrl.startsWith('data:'),
        storageKeys: blobImages
      });
    }

    onCampaignCreate(campaignData);

    // Reset form
    setName("");
    setDescription("");
    setTargetAmount("");
    setEndDate("");
    setUrgent(false);
    setImageUrl("");
    setImageFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please upload an image file");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      setImageUrl(""); // Clear URL if file is selected
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Create New Campaign
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Campaign Name *</Label>
            <Input
              id="name"
              placeholder="Enter campaign name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe your campaign..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Campaign Image</Label>
            <div className="space-y-3">
              {/* File Upload */}
              <div>
                <Label htmlFor="imageFile" className="text-sm text-gray-600">
                  Upload Image
                </Label>
                <Input
                  id="imageFile"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max size: 5MB. Supported formats: JPG, PNG, GIF
                </p>
              </div>

              {/* OR Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              {/* URL Input */}
              <div>
                <Label htmlFor="imageUrl" className="text-sm text-gray-600">
                  Image URL
                </Label>
                <Input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageFile(null); // Clear file if URL is entered
                  }}
                  disabled={!!imageFile}
                  className="mt-1"
                />
              </div>

              {/* Image Preview */}
              {(imageFile || imageUrl) && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <div className="relative w-full h-48 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : imageUrl}
                      alt="Campaign preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/flood.png";
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (SONIC) *</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="0.0"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                step="0.0001"
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={today}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Checkbox
              id="urgent"
              checked={urgent}
              onCheckedChange={(checked) => setUrgent(checked as boolean)}
            />
            <Label htmlFor="urgent" className="cursor-pointer">
              Mark as Urgent Campaign
            </Label>
          </div>

          <Button onClick={handleSubmit} className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}