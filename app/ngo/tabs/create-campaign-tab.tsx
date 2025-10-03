"use client";

import { CreateCampaignForm } from "@/components/create-campaign-form";

interface CreateCampaignTabProps {
  onCampaignCreate: (campaignData: any) => void;
}

export function CreateCampaignTab({ onCampaignCreate }: CreateCampaignTabProps) {
  return (
    <div className="space-y-6">
      <CreateCampaignForm onCampaignCreate={onCampaignCreate} />
    </div>
  );
}
