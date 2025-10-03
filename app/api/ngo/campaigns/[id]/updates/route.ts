import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    const body = await req.json();
    
    // Load campaigns from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'campaigns.json');
    
    let campaigns = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      campaigns = JSON.parse(fileContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Campaigns file not found" },
        { status: 404 }
      );
    }

    // Find campaign by ID
    const campaignIndex = campaigns.findIndex((campaign: any) => campaign.id === campaignId);
    
    if (campaignIndex === -1) {
      return NextResponse.json(
        { success: false, message: "Campaign not found" },
        { status: 404 }
      );
    }

    // Create new update
    const newUpdate = {
      id: Date.now(), // Simple ID generation
      title: body.title,
      content: body.content,
      images: body.images || [],
      createdAt: new Date().toISOString(),
      type: body.type || "general" // general, milestone, financial
    };

    // Add update to campaign
    if (!campaigns[campaignIndex].updates) {
      campaigns[campaignIndex].updates = [];
    }
    campaigns[campaignIndex].updates.unshift(newUpdate); // Add to beginning

    // Update last modified timestamp
    campaigns[campaignIndex].lastUpdated = new Date().toISOString();

    // Save back to file
    fs.writeFileSync(filePath, JSON.stringify(campaigns, null, 2));

    return NextResponse.json({
      success: true,
      message: "Campaign update added successfully",
      update: newUpdate
    });

  } catch (error) {
    console.error("Error adding campaign update:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}