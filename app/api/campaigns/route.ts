import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status') || 'active';

    // Load campaigns from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'campaigns.json');
    
    let campaigns = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      campaigns = JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading campaigns file:', error);
      campaigns = [];
    }

    // Filter campaigns
    let filteredCampaigns = campaigns.filter((campaign: any) => campaign.status === status);

    if (category) {
      filteredCampaigns = filteredCampaigns.filter((campaign: any) => 
        campaign.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort by urgency level and creation date
    filteredCampaigns.sort((a: any, b: any) => {
      const urgencyOrder = { 'critical': 3, 'high': 2, 'medium': 1, 'low': 0 };
      const aUrgency = urgencyOrder[a.urgencyLevel as keyof typeof urgencyOrder] || 0;
      const bUrgency = urgencyOrder[b.urgencyLevel as keyof typeof urgencyOrder] || 0;
      
      if (aUrgency !== bUrgency) {
        return bUrgency - aUrgency; // Higher urgency first
      }
      
      // If same urgency, sort by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply limit if specified
    if (limit) {
      const limitNum = parseInt(limit);
      if (!isNaN(limitNum)) {
        filteredCampaigns = filteredCampaigns.slice(0, limitNum);
      }
    }

    // Add progress percentage to each campaign
    const campaignsWithProgress = filteredCampaigns.map((campaign: any) => ({
      ...campaign,
      progressPercentage: Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100)),
      daysLeft: campaign.endDate ? Math.max(0, Math.ceil((new Date(campaign.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : null
    }));

    return NextResponse.json({
      success: true,
      campaigns: campaignsWithProgress,
      total: campaigns.length,
      filtered: filteredCampaigns.length
    });

  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}