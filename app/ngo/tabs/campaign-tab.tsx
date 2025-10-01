"use client";

import { CampaignCard } from "@/components/campaign-card";
import { Campaign } from "@/lib/mock-data";

interface CampaignsTabProps {
  campaigns: Campaign[];
  onReportUpload: (campaignId: string, file: File) => void;
}

export function CampaignsTab({ campaigns, onReportUpload }: CampaignsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">All Campaigns</h2>
        <p className="text-muted-foreground mb-6">
          View and manage your fundraising campaigns
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onReportUpload={onReportUpload}
          />
        ))}
      </div>
    </div>
  );
}