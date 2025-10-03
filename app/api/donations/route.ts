import { NextResponse } from "next/server";
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Load existing donations
    const donationsFilePath = path.join(process.cwd(), 'mock', 'donations.json');
    const campaignsFilePath = path.join(process.cwd(), 'mock', 'campaigns.json');
    
    let donations = [];
    let campaigns = [];
    
    try {
      const donationsContent = fs.readFileSync(donationsFilePath, 'utf8');
      donations = JSON.parse(donationsContent);
      
      const campaignsContent = fs.readFileSync(campaignsFilePath, 'utf8');
      campaigns = JSON.parse(campaignsContent);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "System files not found" },
        { status: 500 }
      );
    }

    // Generate new donation ID
    const maxId = donations.length > 0 ? Math.max(...donations.map((donation: any) => donation.id)) : 0;
    const newId = maxId + 1;

    // Create new donation record
    const newDonation = {
      id: newId,
      campaignId: body.campaignId,
      donorName: body.donorName || "Anonymous",
      donorEmail: body.donorEmail || null,
      amount: body.amount,
      transactionHash: body.transactionHash,
      walletAddress: body.walletAddress,
      message: body.message || "",
      timestamp: new Date().toISOString(),
      status: "completed",
      currency: "ETH"
    };

    // Add to donations array
    donations.push(newDonation);

    // Update campaign totals
    const campaignIndex = campaigns.findIndex((campaign: any) => campaign.id === body.campaignId);
    if (campaignIndex !== -1) {
      campaigns[campaignIndex].currentAmount += body.amount;
      campaigns[campaignIndex].donorCount += 1;
      campaigns[campaignIndex].lastDonation = new Date().toISOString();
    }

    // Save both files
    fs.writeFileSync(donationsFilePath, JSON.stringify(donations, null, 2));
    fs.writeFileSync(campaignsFilePath, JSON.stringify(campaigns, null, 2));

    return NextResponse.json({
      success: true,
      message: "Donation recorded successfully",
      donation: newDonation,
      campaignUpdated: campaignIndex !== -1
    });

  } catch (error) {
    console.error("Error processing donation:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaignId');

    // Load donations from JSON file
    const filePath = path.join(process.cwd(), 'mock', 'donations.json');
    
    let donations = [];
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      donations = JSON.parse(fileContent);
    } catch (error) {
      donations = [];
    }

    // Filter by campaign if specified
    if (campaignId) {
      donations = donations.filter((donation: any) => donation.campaignId === parseInt(campaignId));
    }

    return NextResponse.json({
      success: true,
      donations: donations
    });

  } catch (error) {
    console.error("Error fetching donations:", error);
    return NextResponse.json(
      { success: false, message: "System error. Please try again later." },
      { status: 500 }
    );
  }
}