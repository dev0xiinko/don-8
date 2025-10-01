"use client";

import { CreateCampaignForm } from "@/components/create-campaign-form";
import { Campaign } from "@/lib/mock-data";

interface CreateCampaignTabProps {
  onCampaignCreate: (campaignData: Omit<Campaign, "id" | "createdAt" | "status">) => void;
}

export function CreateCampaignTab({ onCampaignCreate }: CreateCampaignTabProps) {
  return (
    <div className="space-y-6">
      <CreateCampaignForm onCampaignCreate={onCampaignCreate} />
    </div>
  );
}
