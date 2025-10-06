import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ngoId = searchParams.get('ngoId');
    
    if (!ngoId) {
      return NextResponse.json(
        { success: false, message: 'NGO ID is required' },
        { status: 400 }
      );
    }

    // Load campaigns for this NGO
    const campaignsFilePath = path.join(process.cwd(), 'mock', 'campaigns.json');
    let campaigns = [];
    
    try {
      const campaignsData = fs.readFileSync(campaignsFilePath, 'utf8');
      const allCampaigns = JSON.parse(campaignsData);
      campaigns = allCampaigns.filter((c: any) => c.ngoId === parseInt(ngoId));
    } catch (error) {
      console.error('Error loading campaigns:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to load campaign data' },
        { status: 500 }
      );
    }

    const now = new Date();
    const violatingCampaigns: any[] = [];
    
    // Check each campaign for compliance
    for (const campaign of campaigns) {
      const createdAt = new Date(campaign.createdAt);
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      
      // Check if campaign is older than 7 days
      if (daysSinceCreation > 7) {
        // Load comprehensive campaign data to check for updates/reports
        const campaignFilePath = path.join(process.cwd(), 'mock', 'campaigns', `campaign_${campaign.id}.json`);
        
        let hasUpdates = false;
        let hasReports = false;
        
        try {
          if (fs.existsSync(campaignFilePath)) {
            const campaignData = fs.readFileSync(campaignFilePath, 'utf8');
            const comprehensiveCampaign = JSON.parse(campaignData);
            
            hasUpdates = comprehensiveCampaign.updates && comprehensiveCampaign.updates.length > 0;
            hasReports = comprehensiveCampaign.reports && comprehensiveCampaign.reports.length > 0;
          }
        } catch (error) {
          console.error(`Error loading comprehensive data for campaign ${campaign.id}:`, error);
        }
        
        // If no updates or reports, this campaign violates the constraint
        if (!hasUpdates && !hasReports) {
          violatingCampaigns.push({
            ...campaign,
            daysSinceCreation,
            hasUpdates,
            hasReports
          });
        }
      }
    }
    
    const canWithdraw = violatingCampaigns.length === 0;
    let message = '';
    
    if (canWithdraw) {
      message = 'All campaigns meet the update requirements. Withdrawal is allowed.';
    } else {
      message = `${violatingCampaigns.length} campaign(s) need updates. Campaigns older than 7 days must have progress updates or reports.`;
    }
    
    return NextResponse.json({
      success: true,
      canWithdraw,
      violatingCampaigns,
      totalCampaigns: campaigns.length,
      message,
      constraint: {
        rule: 'Campaigns older than 7 days must have at least one update or report',
        dayLimit: 7,
        checkTime: now.toISOString()
      }
    });
    
  } catch (error) {
    console.error('Error checking withdrawal constraints:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}