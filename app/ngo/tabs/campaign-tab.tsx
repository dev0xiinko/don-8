"use client";

import { NGOCampaignCard } from "@/components/ngo-campaign-card";
import { Campaign } from "@/lib/mock-data";

interface CampaignsTabProps {
  campaigns: Campaign[];
  onReportUpload: (campaignId: string, file: File) => void;
  onUpdateAdded?: (campaignId: string | number) => void;
}

export function CampaignsTab({ campaigns, onReportUpload, onUpdateAdded }: CampaignsTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">All Campaigns</h2>
        <p className="text-muted-foreground mb-6">
          View and manage your fundraising campaigns. Upload reports and post updates to keep donors engaged.
        </p>
      </div>
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">No campaigns yet</div>
          <p className="text-sm text-muted-foreground">
            Create your first campaign to start raising funds for your cause.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {campaigns.map((campaign) => (
            <NGOCampaignCard
              key={campaign.id}
              campaign={campaign}
              onReportUpload={onReportUpload}
              onUpdateAdded={onUpdateAdded}
            />
          ))}
        </div>
      )}
    </div>
  );
}