import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const ngoId = url.searchParams.get('ngoId');

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

    // Filter campaigns by NGO ID if provided, otherwise return all
    const filteredCampaigns = ngoId 
      ? campaigns.filter((campaign: any) => campaign.ngoId === parseInt(ngoId))
      : campaigns;

    return NextResponse.json({
      success: true,
      campaigns: filteredCampaigns
    });

  } catch (error) {
    console.error("Error fetching NGO campaigns:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Load existing campaigns
    const filePath = path.join(process.cwd(), 'mock', 'campaigns.json');
    let campaigns = [];
    
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      campaigns = JSON.parse(fileContent);
    } catch (error) {
      campaigns = [];
    }

    // Generate new campaign ID
    const maxId = campaigns.length > 0 ? Math.max(...campaigns.map((campaign: any) => campaign.id)) : 0;
    const newId = maxId + 1;

    // Create new campaign object with all necessary fields
    const newCampaign = {
      id: newId,
      title: body.title,
      description: body.description,
      longDescription: body.longDescription || body.description,
      ngoId: body.ngoId,
      ngoName: body.ngoName,
      category: body.category,
      targetAmount: parseFloat(body.targetAmount),
      raisedAmount: 0,
      currentAmount: 0,
      donorCount: 0,
      imageUrl: body.imageUrl || (body.images && body.images.length > 0 ? body.images[0] : null),
      images: body.images || [],
      location: body.location,
      startDate: new Date().toISOString(),
      endDate: body.endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
      featured: body.featured || false,
      urgencyLevel: body.urgencyLevel || "normal",
      walletAddress: body.walletAddress,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      beneficiaries: body.beneficiaries || 0,
      tags: body.tags || [],
      updates: [],
      milestones: body.milestones || []
    };

    // Add to campaigns array
    campaigns.push(newCampaign);

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(campaigns, null, 2));

    return NextResponse.json({
      success: true,
      message: "Campaign created successfully",
      campaign: newCampaign
    });

  } catch (error) {
    console.error("Error creating campaign:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}