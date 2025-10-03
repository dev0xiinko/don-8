// API endpoint for managing campaign donations JSON files
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DONATIONS_DIR = path.join(process.cwd(), 'mock', 'donations')
const CAMPAIGNS_FILE = path.join(process.cwd(), 'mock', 'campaigns.json')

// Ensure donations directory exists
async function ensureDonationsDir() {
  try {
    await fs.access(DONATIONS_DIR)
  } catch {
    await fs.mkdir(DONATIONS_DIR, { recursive: true })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    await ensureDonationsDir()
    const campaignId = params.campaignId
    const filePath = path.join(DONATIONS_DIR, `${campaignId}.json`)
    
    try {
      const data = await fs.readFile(filePath, 'utf8')
      const donations = JSON.parse(data)
      return NextResponse.json({ success: true, donations })
    } catch (error) {
      // File doesn't exist yet, return empty array
      return NextResponse.json({ success: true, donations: [] })
    }
  } catch (error) {
    console.error('Error reading donations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read donations' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    await ensureDonationsDir()
    const campaignId = params.campaignId
    const filePath = path.join(DONATIONS_DIR, `${campaignId}.json`)
    
    const { donations } = await request.json()
    
    // Save donations to file
    await fs.writeFile(filePath, JSON.stringify(donations, null, 2))
    
    // Update campaign raised amount
    await updateCampaignRaisedAmount(campaignId, donations)
    
    return NextResponse.json({ success: true, message: 'Donations saved successfully' })
  } catch (error) {
    console.error('Error saving donations:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to save donations' },
      { status: 500 }
    )
  }
}

// Update campaign raised amount in campaigns.json
async function updateCampaignRaisedAmount(campaignId: string, donations: any[]) {
  try {
    // Calculate total raised from confirmed donations
    const confirmedDonations = donations.filter(d => d.status === 'confirmed')
    const totalRaised = confirmedDonations.reduce((sum, d) => sum + parseFloat(d.amount || '0'), 0)
    const uniqueDonors = new Set(donations.map(d => d.anonymous ? 'anonymous' : d.donorAddress)).size
    
    // Read campaigns.json
    const campaignsData = await fs.readFile(CAMPAIGNS_FILE, 'utf8')
    const campaigns = JSON.parse(campaignsData)
    
    // Find and update the campaign
    const campaignIndex = campaigns.findIndex((c: any) => c.id.toString() === campaignId)
    if (campaignIndex !== -1) {
      campaigns[campaignIndex] = {
        ...campaigns[campaignIndex],
        raisedAmount: totalRaised,
        currentAmount: totalRaised,
        donorCount: uniqueDonors,
        lastUpdated: new Date().toISOString()
      }
      
      // Save updated campaigns.json
      await fs.writeFile(CAMPAIGNS_FILE, JSON.stringify(campaigns, null, 2))
      
      console.log(`Campaign ${campaignId} raised amount updated to ${totalRaised} SONIC`)
    }
  } catch (error) {
    console.error('Error updating campaign raised amount:', error)
  }
}