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

interface Campaign {
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  endDate: string;
  urgent: boolean;
  donorCount: number;
}

interface CreateCampaignFormProps {
  onCampaignCreate: (
    campaignData: Omit<Campaign, "id" | "createdAt" | "status">
  ) => void;
}

export function CreateCampaignForm({
  onCampaignCreate,
}: CreateCampaignFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [endDate, setEndDate] = useState("");
  const [urgent, setUrgent] = useState(false);

  const handleSubmit = () => {
    if (!name || !description || !targetAmount || !endDate) {
      alert("Please fill in all required fields");
      return;
    }

    const campaignData = {
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      currentAmount: 0,
      endDate,
      urgent,
      donorCount: 0,
    };

    onCampaignCreate(campaignData);

    // Reset form
    setName("");
    setDescription("");
    setTargetAmount("");
    setEndDate("");
    setUrgent(false);
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount (ETH) *</Label>
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
