import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Comprehensive campaign data structure with integrated donations
interface CampaignData {
  // Basic campaign info
  id: number
  title: string
  description: string
  longDescription: string
  ngoId: number
  ngoName: string
  category: string
  location: string
  targetAmount: number
  status: string
  featured: boolean
  urgencyLevel: string
  walletAddress: string
  createdAt: string
  lastUpdated: string
  
  // Campaign details
  beneficiaries: number
  tags: string[]
  imageUrl: string
  images: string[]
  startDate: string
  endDate: string
  
  // Calculated stats (auto-updated)
  stats: {
    totalDonations: number
    totalAmount: number
    confirmedAmount: number
    pendingAmount: number
    donorCount: number
    uniqueDonors: number
    lastDonationAt?: string
  }
  
  // Updates and milestones
  updates: any[]
  milestones: any[]
  
  // Reports
  reports: ReportRecord[]
  
  // Integrated donations
  donations: DonationRecord[]
}

interface DonationRecord {
  id: string
  donor: string
  donorAddress: string
  amount: number | string
  currency?: string
  transactionHash: string
  txHash: string
  blockNumber?: number
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  gasUsed?: number
  gasPrice?: number
  anonymous?: boolean
  confirmedAt?: string
  explorerUrl?: string
  message?: string
  networkName?: string
}

interface ReportRecord {
  id: string
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  reportType: string
  description: string
  uploadedAt: string
  uploadedBy: string
}

const CAMPAIGNS_DIR = path.join(process.cwd(), 'mock', 'campaigns')
const LEGACY_CAMPAIGNS_FILE = path.join(process.cwd(), 'mock', 'campaigns.json')

// Ensure campaigns directory exists
function ensureCampaignsDir() {
  if (!fs.existsSync(CAMPAIGNS_DIR)) {
    fs.mkdirSync(CAMPAIGNS_DIR, { recursive: true })
  }
}

// Get comprehensive campaign data by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id
    console.log(`📊 Getting comprehensive data for campaign: ${campaignId}`)
    
    ensureCampaignsDir()
    
    const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaignId}.json`)
    
    // Check if comprehensive file exists
    if (fs.existsSync(campaignFile)) {
      const fileContent = fs.readFileSync(campaignFile, 'utf8')
      const campaignData: CampaignData = JSON.parse(fileContent)
      
      console.log(`✅ Found comprehensive data for campaign ${campaignId}`)
      console.log(`📦 Contains ${campaignData.donations.length} donations`)
      
      return NextResponse.json({
        success: true,
        campaign: campaignData
      })
    }
    
    // Fallback: migrate from legacy system
    console.log(`🔄 Migrating campaign ${campaignId} to comprehensive format`)
    const migratedCampaign = await migrateLegacyCampaign(campaignId)
    
    if (migratedCampaign) {
      return NextResponse.json({
        success: true,
        campaign: migratedCampaign
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      )
    }
    
  } catch (error) {
    console.error('Error getting campaign data:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get campaign data' },
      { status: 500 }
    )
  }
}

// Update campaign data (for donations, stats, updates)
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const campaignId = params.id
    const updateData = await request.json()
    
    console.log(`🔄 Updating campaign ${campaignId}:`, Object.keys(updateData))
    
    ensureCampaignsDir()
    
    const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaignId}.json`)
    
    // Load existing campaign data
    let campaignData: CampaignData
    
    if (fs.existsSync(campaignFile)) {
      const fileContent = fs.readFileSync(campaignFile, 'utf8')
      campaignData = JSON.parse(fileContent)
    } else {
      // Create from migration if not exists
      const migratedData = await migrateLegacyCampaign(campaignId)
      if (!migratedData) {
        return NextResponse.json(
          { success: false, error: 'Campaign not found' },
          { status: 404 }
        )
      }
      campaignData = migratedData
    }
    
    // Handle different update types
    if (updateData.type === 'add_donation') {
      // Add new donation
      const donation: DonationRecord = {
        id: updateData.donation.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        donor: updateData.donation.donor || updateData.donation.donorAddress || 'Anonymous',
        donorAddress: updateData.donation.donorAddress,
        txHash: updateData.donation.txHash,
        transactionHash: updateData.donation.txHash,
        amount: updateData.donation.amount,
        currency: updateData.donation.currency || 'SONIC',
        timestamp: new Date().toISOString(),
        status: updateData.donation.status || 'pending',
        blockNumber: updateData.donation.blockNumber,
        gasUsed: updateData.donation.gasUsed,
        explorerUrl: updateData.donation.explorerUrl,
        message: updateData.donation.message || '',
        anonymous: updateData.donation.anonymous || false,
        networkName: updateData.donation.networkName || 'Sonic Blaze Testnet'
      }
      
      // Add to beginning (newest first)
      campaignData.donations.unshift(donation)
      console.log(`💰 Added donation: ${donation.amount} ${donation.currency}`)
      
    } else if (updateData.type === 'update_donation_status') {
      // Update donation status
      const donationIndex = campaignData.donations.findIndex(d => d.txHash === updateData.txHash)
      
      if (donationIndex !== -1) {
        campaignData.donations[donationIndex] = {
          ...campaignData.donations[donationIndex],
          status: updateData.status,
          blockNumber: updateData.blockNumber,
          gasUsed: updateData.gasUsed,
          confirmedAt: updateData.status === 'confirmed' ? new Date().toISOString() : undefined
        }
        console.log(`✅ Updated donation status: ${updateData.txHash} -> ${updateData.status}`)
      }
      
    } else if (updateData.type === 'add_update') {
      // Add campaign update
      campaignData.updates.unshift(updateData.update)
      console.log(`📢 Added campaign update`)
      
    } else if (updateData.type === 'update_details') {
      // Update campaign details
      Object.assign(campaignData, updateData.details)
      console.log(`📝 Updated campaign details`)
      
    } else if (updateData.type === 'update_timestamp') {
      // Update lastUpdated timestamp (for real-time updates)
      console.log(`🕒 Updating timestamp for ${updateData.source || 'unknown source'}`)
      // The timestamp will be updated below automatically
    }
    
    // Recalculate stats
    campaignData.stats = calculateCampaignStats(campaignData.donations)
    campaignData.lastUpdated = new Date().toISOString()
    
    // Save updated campaign data
    fs.writeFileSync(campaignFile, JSON.stringify(campaignData, null, 2))
    
    console.log(`💾 Saved comprehensive campaign data: ${campaignData.donations.length} donations, ${campaignData.stats.confirmedAmount} SONIC raised`)
    
    return NextResponse.json({
      success: true,
      campaign: campaignData,
      message: 'Campaign updated successfully'
    })
    
  } catch (error) {
    console.error('Error updating campaign:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update campaign' },
      { status: 500 }
    )
  }
}

// Helper function to calculate campaign statistics
function calculateCampaignStats(donations: DonationRecord[]) {
  const confirmed = donations.filter(d => d.status === 'confirmed')
  const pending = donations.filter(d => d.status === 'pending')
  
  const confirmedAmount = confirmed.reduce((sum, d) => sum + parseFloat(d.amount?.toString() || '0'), 0)
  const pendingAmount = pending.reduce((sum, d) => sum + parseFloat(d.amount?.toString() || '0'), 0)
  const totalAmount = confirmedAmount + pendingAmount
  
  const uniqueDonors = new Set(
    donations
      .filter(d => !d.anonymous)
      .map(d => d.donorAddress.toLowerCase())
  ).size
  
  const lastDonation = donations.length > 0 ? donations[0] : null
  
  return {
    totalDonations: donations.length,
    totalAmount: totalAmount,
    confirmedAmount: confirmedAmount,
    pendingAmount: pendingAmount,
    donorCount: donations.length,
    uniqueDonors: uniqueDonors,
    lastDonationAt: lastDonation?.timestamp
  }
}

// Migrate legacy campaign from campaigns.json
async function migrateLegacyCampaign(campaignId: string): Promise<CampaignData | null> {
  try {
    console.log(`🔄 Migrating legacy campaign ${campaignId}`)
    
    // Read legacy campaigns.json
    if (!fs.existsSync(LEGACY_CAMPAIGNS_FILE)) {
      return null
    }
    
    const legacyContent = fs.readFileSync(LEGACY_CAMPAIGNS_FILE, 'utf8')
    const legacyCampaigns = JSON.parse(legacyContent)
    
    const legacyCampaign = legacyCampaigns.find((c: any) => c.id.toString() === campaignId)
    
    if (!legacyCampaign) {
      return null
    }
    
    // Check for existing donations in old system
    const donationsDir = path.join(process.cwd(), 'mock', 'donations')
    const oldDonationFile = path.join(donationsDir, `${campaignId}.json`)
    const altDonationFile = path.join(donationsDir, `campaign_${campaignId}.json`)
    
    let existingDonations: DonationRecord[] = []
    
    // Try to load existing donations
    for (const file of [oldDonationFile, altDonationFile]) {
      if (fs.existsSync(file)) {
        try {
          const donationContent = fs.readFileSync(file, 'utf8')
          const donations = JSON.parse(donationContent)
          existingDonations = donations.map((d: any) => ({
            ...d,
            timestamp: d.timestamp || new Date().toISOString()
          }))
          console.log(`📦 Found ${existingDonations.length} existing donations for campaign ${campaignId}`)
          break
        } catch (error) {
          console.error('Error reading existing donations:', error)
        }
      }
    }
    
    // Create comprehensive campaign data
    const comprehensiveCampaign: CampaignData = {
      id: legacyCampaign.id,
      title: legacyCampaign.title || legacyCampaign.name,
      description: legacyCampaign.description,
      longDescription: legacyCampaign.longDescription || legacyCampaign.description,
      ngoId: legacyCampaign.ngoId,
      ngoName: legacyCampaign.ngoName,
      category: legacyCampaign.category,
      location: legacyCampaign.location || 'Philippines',
      targetAmount: legacyCampaign.targetAmount || 100,
      status: legacyCampaign.status || 'active',
      featured: legacyCampaign.featured || false,
      urgencyLevel: legacyCampaign.urgencyLevel || 'normal',
      walletAddress: legacyCampaign.walletAddress,
      createdAt: legacyCampaign.createdAt || new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      
      beneficiaries: legacyCampaign.beneficiaries || 0,
      tags: legacyCampaign.tags || [],
      imageUrl: legacyCampaign.imageUrl || '',
      images: legacyCampaign.images || [],
      startDate: legacyCampaign.startDate || legacyCampaign.createdAt,
      endDate: legacyCampaign.endDate || '2025-12-31',
      
      stats: calculateCampaignStats(existingDonations),
      updates: legacyCampaign.updates || [],
      milestones: legacyCampaign.milestones || [],
      reports: legacyCampaign.reports || [],
      donations: existingDonations
    }
    
    // Save comprehensive format
    const campaignFile = path.join(CAMPAIGNS_DIR, `campaign_${campaignId}.json`)
    fs.writeFileSync(campaignFile, JSON.stringify(comprehensiveCampaign, null, 2))
    
    console.log(`✅ Migrated campaign ${campaignId} to comprehensive format`)
    console.log(`📊 Stats: ${comprehensiveCampaign.donations.length} donations, ${comprehensiveCampaign.stats.confirmedAmount} SONIC confirmed`)
    
    return comprehensiveCampaign
    
  } catch (error) {
    console.error('Error migrating legacy campaign:', error)
    return null
  }
}