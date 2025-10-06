"use client";

import { useState, useEffect } from "react";
import { NGOCampaignCard } from "@/components/ngo-campaign-card";
import { Campaign } from "@/lib/mock-data";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CampaignsTabProps {
  campaigns: Campaign[];
  onReportUpload: (campaignId: string, file: File, reportType?: string, description?: string) => Promise<void>;
  onUpdateAdded?: (campaignId: string | number) => void;
}

// Enhanced campaign interface with real donation stats
interface EnhancedCampaign extends Campaign {
  totalDonations?: number;
  raisedAmount?: number;
}

export function CampaignsTab({ campaigns, onReportUpload, onUpdateAdded }: CampaignsTabProps) {
  const [enrichedCampaigns, setEnrichedCampaigns] = useState<EnhancedCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch campaigns with real-time comprehensive data - ONLY for current NGO
  const fetchEnrichedCampaigns = async (forceRefresh = false) => {
    try {
      if (forceRefresh) setRefreshing(true);
      
      // Get current NGO info from session storage
      const ngoInfo = sessionStorage.getItem('ngo_info');
      if (!ngoInfo) {
        console.warn('No NGO session found - cannot filter campaigns');
        setEnrichedCampaigns([]);
        return;
      }
      
      const currentNGO = JSON.parse(ngoInfo);
      const currentNGOId = currentNGO.id || currentNGO.ngoId;
      
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      
      if (result.success) {
        // Filter campaigns to ONLY show those belonging to the current NGO
        const ngoSpecificCampaigns = result.campaigns.filter((campaign: any) => {
          const matches = campaign.ngoId === currentNGOId || 
                         (campaign.ngoName && campaign.ngoName === currentNGO.name);
          if (matches) {
            console.log(`✅ Campaign matches NGO ${currentNGOId}:`, {
              campaignId: campaign.id,
              campaignNgoId: campaign.ngoId,
              campaignNgoName: campaign.ngoName,
              currentNGOId,
              currentNGOName: currentNGO.name
            });
          }
          return matches;
        });
        
        console.log(`🔍 Filtering campaigns for NGO ${currentNGO.name} (ID: ${currentNGOId}):`, {
          totalCampaigns: result.campaigns.length,
          ngoSpecificCampaigns: ngoSpecificCampaigns.length,
          allCampaigns: result.campaigns.map((c: any) => ({
            id: c.id,
            ngoId: c.ngoId,
            ngoName: c.ngoName,
            title: c.title
          }))
        });
        
        // Enrich campaigns with real donation stats from comprehensive data
        const enhanced = ngoSpecificCampaigns.map((campaign: any) => ({
          ...campaign,
          // Use the stats already calculated by the API from comprehensive files
          raisedAmount: campaign.raisedAmount || 0,
          currentAmount: campaign.currentAmount || campaign.raisedAmount || 0,
          donorCount: campaign.donorCount || 0,
          totalDonations: campaign.totalDonations || 0
        }));
        
        setEnrichedCampaigns(enhanced);
        
        console.log(`NGO ${currentNGO.name} campaigns loaded with real stats:`, enhanced.length);
        enhanced.forEach((campaign: any, index: number) => {
          console.log(`${currentNGO.name} Campaign ${index + 1}:`, {
            id: campaign.id,
            ngoId: campaign.ngoId,
            title: campaign.title || campaign.name,
            totalRaised: campaign.raisedAmount,
            donorCount: campaign.donorCount,
            totalDonations: campaign.totalDonations
          });
        });
      }
    } catch (error) {
      console.error('Error fetching enriched campaigns:', error);
      // Fallback to provided campaigns if API fails
      console.log('📋 Using fallback campaigns from props:', campaigns);
      const fallbackEnriched = campaigns.map(c => ({ 
        ...c, 
        raisedAmount: c.raisedAmount || c.currentAmount || 0, 
        totalDonations: 0 
      }));
      setEnrichedCampaigns(fallbackEnriched);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh campaigns data every 15 seconds for real-time updates
  useEffect(() => {
    fetchEnrichedCampaigns();
    
    const interval = setInterval(() => {
      fetchEnrichedCampaigns(false);
    }, 15000); // Refresh every 15 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Refresh when campaigns prop changes
  useEffect(() => {
    console.log('📋 Campaigns prop changed:', campaigns.length, 'campaigns');
    if (campaigns.length > 0) {
      console.log('🔄 Fetching enriched campaigns due to prop change');
      fetchEnrichedCampaigns();
    } else {
      console.log('⚠️ No campaigns in props, but will still try to fetch from API');
      // Always try to fetch, even if props are empty
      fetchEnrichedCampaigns();
    }
  }, [campaigns]);

  const handleRefresh = () => {
    fetchEnrichedCampaigns(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">All Campaigns</h2>
          <p className="text-muted-foreground">
            View and manage your fundraising campaigns with real-time donation data. Upload reports and post updates to keep donors engaged.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>
      {/* Loading State */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : enrichedCampaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg mb-2">No campaigns yet</div>
          <p className="text-sm text-muted-foreground">
            Create your first campaign to start raising funds for your cause. Only your organization's campaigns will be displayed here.
          </p>
        </div>
      ) : (
        <>
          {/* Real-time Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg border">
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {enrichedCampaigns.reduce((sum: number, campaign: any) => sum + (campaign.raisedAmount || 0), 0).toFixed(4)} SONIC
              </div>
              <div className="text-sm text-muted-foreground">Total Raised</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {enrichedCampaigns.reduce((sum: number, campaign: any) => sum + (campaign.donorCount || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Donors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {enrichedCampaigns.reduce((sum: number, campaign: any) => sum + (campaign.totalDonations || 0), 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Donations</div>
            </div>
          </div>

          {/* Campaigns Grid with Real-time Data */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {enrichedCampaigns.map((campaign) => (
              <NGOCampaignCard
                key={campaign.id}
                campaign={campaign}
                onReportUpload={onReportUpload}
                onUpdateAdded={onUpdateAdded}
              />
            ))}
          </div>
          
          {/* Last Updated Info */}
          <div className="text-center text-xs text-muted-foreground">
            Showing only your organization's campaigns • Data auto-refreshes every 15 seconds • Last updated: {new Date().toLocaleTimeString()}
            {refreshing && <span className="ml-2 text-blue-600">• Refreshing...</span>}
          </div>
        </>
      )}
    </div>
  );
}