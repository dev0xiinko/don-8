import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// Dynamic Campaign Data Manager
class CampaignDataManager {
  private static instance: CampaignDataManager
  private campaignsDir: string
  private legacyFile: string
  private donationsDir: string
  
  constructor() {
    this.campaignsDir = path.join(process.cwd(), 'mock', 'campaigns')
    this.legacyFile = path.join(process.cwd(), 'mock', 'campaigns.json')
    this.donationsDir = path.join(process.cwd(), 'mock', 'donations')
    this.ensureDirectories()
  }

  static getInstance(): CampaignDataManager {
    if (!CampaignDataManager.instance) {
      CampaignDataManager.instance = new CampaignDataManager()
    }
    return CampaignDataManager.instance
  }

  private ensureDirectories() {
    if (!fs.existsSync(this.campaignsDir)) {
      fs.mkdirSync(this.campaignsDir, { recursive: true })
    }
    if (!fs.existsSync(this.donationsDir)) {
      fs.mkdirSync(this.donationsDir, { recursive: true })
    }
  }

  // Sync data from multiple sources with conflict resolution
  async syncCampaignData(campaignId: string): Promise<CampaignData | null> {
    try {
      console.log(`🔄 Dynamic sync for campaign ${campaignId}`)
      
      const sources = await this.loadAllDataSources(campaignId)
      const mergedData = this.mergeDataSources(sources)
      
      if (!mergedData) {
        return null
      }

      // Validate and clean data
      const validatedData = this.validateCampaignData(mergedData)
      
      // Save synchronized version
      await this.saveCampaignData(campaignId, validatedData)
      
      return validatedData
    } catch (error) {
      console.error(`❌ Error syncing campaign ${campaignId}:`, error)
      return null
    }
  }

  private async loadAllDataSources(campaignId: string): Promise<DataSources> {
    const sources: DataSources = {
      comprehensive: null,
      legacy: null,
      donations: [],
      localStorage: null
    }

    // Load comprehensive data
    const comprehensiveFile = path.join(this.campaignsDir, `campaign_${campaignId}.json`)
    if (fs.existsSync(comprehensiveFile)) {
      try {
        const content = fs.readFileSync(comprehensiveFile, 'utf8')
        sources.comprehensive = JSON.parse(content)
        console.log(`📦 Loaded comprehensive data: ${sources.comprehensive?.donations?.length || 0} donations`)
      } catch (error) {
        console.error('Error loading comprehensive data:', error)
      }
    }

    // Load legacy data
    if (fs.existsSync(this.legacyFile)) {
      try {
        const content = fs.readFileSync(this.legacyFile, 'utf8')
        const campaigns = JSON.parse(content)
        sources.legacy = campaigns.find((c: any) => c.id.toString() === campaignId)
        console.log(`📋 Loaded legacy data: ${sources.legacy?.title || 'Not found'}`)
      } catch (error) {
        console.error('Error loading legacy data:', error)
      }
    }

    // Load donations from multiple sources
    const donationFiles = [
      path.join(this.donationsDir, `${campaignId}.json`),
      path.join(this.donationsDir, `campaign_${campaignId}.json`)
    ]

    for (const file of donationFiles) {
      if (fs.existsSync(file)) {
        try {
          const content = fs.readFileSync(file, 'utf8')
          const donations = JSON.parse(content)
          sources.donations.push(...donations)
          console.log(`💰 Loaded ${donations.length} donations from ${path.basename(file)}`)
        } catch (error) {
          console.error(`Error loading donations from ${file}:`, error)
        }
      }
    }

    return sources
  }

  private mergeDataSources(sources: DataSources): CampaignData | null {
    // Priority: comprehensive > legacy for basic info
    // But always use most recent timestamps for updates/donations
    
    const baseData = sources.comprehensive || sources.legacy
    if (!baseData) {
      return null
    }

    // Merge donations with deduplication
    const allDonations = [
      ...(sources.comprehensive?.donations || []),
      ...sources.donations,
    ]

    // Deduplicate donations by transaction hash
    const uniqueDonations = this.deduplicateDonations(allDonations)
    
    // Sort donations by timestamp (newest first)
    uniqueDonations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Merge updates (prioritize most recent)
    const allUpdates = [
      ...(sources.comprehensive?.updates || []),
      ...(sources.legacy?.updates || [])
    ]
    
    const uniqueUpdates = this.deduplicateUpdates(allUpdates)
    uniqueUpdates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Create merged campaign data with conflict resolution
    const mergedData: CampaignData = {
      // Basic info - prefer comprehensive, fallback to legacy
      id: baseData.id,
      title: sources.comprehensive?.title || sources.legacy?.title || baseData.title,
      description: sources.comprehensive?.description || sources.legacy?.description || baseData.description,
      longDescription: sources.comprehensive?.longDescription || sources.legacy?.longDescription || baseData.longDescription || baseData.description,
      
      // NGO info - prefer most recent
      ngoId: this.resolveMostRecent(sources.comprehensive?.ngoId, sources.legacy?.ngoId) || baseData.ngoId,
      ngoName: this.resolveMostRecent(sources.comprehensive?.ngoName, sources.legacy?.ngoName) || baseData.ngoName,
      
      // Campaign details
      category: sources.comprehensive?.category || sources.legacy?.category || baseData.category,
      location: sources.comprehensive?.location || sources.legacy?.location || baseData.location || 'Philippines',
      targetAmount: sources.comprehensive?.targetAmount || sources.legacy?.targetAmount || baseData.targetAmount,
      status: sources.comprehensive?.status || sources.legacy?.status || baseData.status || 'active',
      featured: sources.comprehensive?.featured ?? sources.legacy?.featured ?? baseData.featured ?? false,
      urgencyLevel: sources.comprehensive?.urgencyLevel || sources.legacy?.urgencyLevel || baseData.urgencyLevel || 'normal',
      walletAddress: sources.comprehensive?.walletAddress || sources.legacy?.walletAddress || baseData.walletAddress,
      
      // Timestamps - use most recent
      createdAt: this.resolveMostRecent(sources.comprehensive?.createdAt, sources.legacy?.createdAt) || baseData.createdAt,
      lastUpdated: new Date().toISOString(),
      
      // Visual assets
      beneficiaries: sources.comprehensive?.beneficiaries || sources.legacy?.beneficiaries || 0,
      tags: [...new Set([
        ...(sources.comprehensive?.tags || []),
        ...(sources.legacy?.tags || [])
      ])],
      imageUrl: sources.comprehensive?.imageUrl || sources.legacy?.imageUrl || '',
      images: [...new Set([
        ...(sources.comprehensive?.images || []),
        ...(sources.legacy?.images || [])
      ])],
      startDate: this.resolveMostRecent(sources.comprehensive?.startDate, sources.legacy?.startDate) || baseData.startDate || baseData.createdAt,
      endDate: sources.comprehensive?.endDate || sources.legacy?.endDate || baseData.endDate,
      
      // Dynamic data
      stats: this.calculateStats(uniqueDonations),
      updates: uniqueUpdates,
      milestones: sources.comprehensive?.milestones || sources.legacy?.milestones || [],
      reports: sources.comprehensive?.reports || [],
      donations: uniqueDonations
    }

    console.log(`🔄 Merged campaign data:`)
    console.log(`   - Title: ${mergedData.title}`)
    console.log(`   - NGO: ${mergedData.ngoName} (ID: ${mergedData.ngoId})`)
    console.log(`   - Donations: ${mergedData.donations.length}`)
    console.log(`   - Updates: ${mergedData.updates.length}`)
    console.log(`   - Total raised: ${mergedData.stats.confirmedAmount} SONIC`)

    return mergedData
  }

  private deduplicateDonations(donations: DonationRecord[]): DonationRecord[] {
    const seen = new Set<string>()
    const unique: DonationRecord[] = []
    
    for (const donation of donations) {
      // Use transaction hash as primary key, fallback to id
      const key = donation.txHash || donation.transactionHash || donation.id
      if (key && !seen.has(key)) {
        seen.add(key)
        // Ensure consistent format
        unique.push({
          ...donation,
          txHash: donation.txHash || donation.transactionHash,
          transactionHash: donation.txHash || donation.transactionHash,
          donor: donation.donor || donation.donorAddress || 'Anonymous',
          amount: typeof donation.amount === 'string' ? donation.amount : donation.amount.toString()
        })
      }
    }
    
    return unique
  }

  private deduplicateUpdates(updates: any[]): any[] {
    const seen = new Set<string>()
    const unique: any[] = []
    
    for (const update of updates) {
      // Use combination of timestamp and title as key
      const key = `${update.createdAt}_${update.title}`
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(update)
      }
    }
    
    return unique
  }

  private resolveMostRecent(val1: any, val2: any): any {
    if (!val1) return val2
    if (!val2) return val1
    // For now, prefer val1 (comprehensive data)
    return val1
  }

  private calculateStats(donations: DonationRecord[]): CampaignStats {
    const confirmed = donations.filter(d => d.status === 'confirmed')
    const pending = donations.filter(d => d.status === 'pending')
    
    const confirmedAmount = confirmed.reduce((sum, d) => {
      const amount = typeof d.amount === 'string' ? parseFloat(d.amount) : d.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const pendingAmount = pending.reduce((sum, d) => {
      const amount = typeof d.amount === 'string' ? parseFloat(d.amount) : d.amount
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
    
    const totalAmount = confirmedAmount + pendingAmount
    
    const uniqueDonors = new Set(
      donations
        .filter(d => !d.anonymous && d.donorAddress)
        .map(d => d.donorAddress.toLowerCase())
    ).size
    
    const lastDonation = donations.length > 0 ? donations[0] : null
    
    return {
      totalDonations: donations.length,
      totalAmount: Math.round(totalAmount * 1000) / 1000, // Round to 3 decimal places
      confirmedAmount: Math.round(confirmedAmount * 1000) / 1000,
      pendingAmount: Math.round(pendingAmount * 1000) / 1000,
      donorCount: donations.length,
      uniqueDonors: uniqueDonors,
      lastDonationAt: lastDonation?.timestamp
    }
  }

  private validateCampaignData(data: CampaignData): CampaignData {
    // Ensure required fields
    if (!data.title) data.title = `Campaign ${data.id}`
    if (!data.description) data.description = data.title
    if (!data.longDescription) data.longDescription = data.description
    if (!data.ngoName) data.ngoName = 'Unknown NGO'
    if (!data.category) data.category = 'General'
    if (!data.walletAddress) data.walletAddress = ''
    if (!data.createdAt) data.createdAt = new Date().toISOString()
    
    // Ensure arrays
    if (!Array.isArray(data.tags)) data.tags = []
    if (!Array.isArray(data.images)) data.images = []
    if (!Array.isArray(data.updates)) data.updates = []
    if (!Array.isArray(data.milestones)) data.milestones = []
    if (!Array.isArray(data.reports)) data.reports = []
    if (!Array.isArray(data.donations)) data.donations = []
    
    // Validate numbers
    if (typeof data.targetAmount !== 'number' || data.targetAmount <= 0) {
      data.targetAmount = 100
    }
    
    return data
  }

  private async saveCampaignData(campaignId: string, data: CampaignData): Promise<void> {
    const comprehensiveFile = path.join(this.campaignsDir, `campaign_${campaignId}.json`)
    
    try {
      fs.writeFileSync(comprehensiveFile, JSON.stringify(data, null, 2))
      console.log(`💾 Saved synchronized campaign data to ${comprehensiveFile}`)
      
      // Also update legacy file for backwards compatibility
      await this.updateLegacyFile(data)
      
    } catch (error) {
      console.error('Error saving campaign data:', error)
      throw error
    }
  }

  private async updateLegacyFile(campaignData: CampaignData): Promise<void> {
    try {
      let campaigns: any[] = []
      
      if (fs.existsSync(this.legacyFile)) {
        const content = fs.readFileSync(this.legacyFile, 'utf8')
        campaigns = JSON.parse(content)
      }
      
      // Update or add campaign in legacy format
      const legacyFormat = {
        id: campaignData.id,
        title: campaignData.title,
        description: campaignData.description,
        longDescription: campaignData.longDescription,
        ngoId: campaignData.ngoId,
        ngoName: campaignData.ngoName,
        category: campaignData.category,
        targetAmount: campaignData.targetAmount,
        raisedAmount: campaignData.stats.confirmedAmount,
        currentAmount: campaignData.stats.confirmedAmount,
        donorCount: campaignData.stats.donorCount,
        imageUrl: campaignData.imageUrl,
        images: campaignData.images,
        location: campaignData.location,
        startDate: campaignData.startDate,
        endDate: campaignData.endDate,
        status: campaignData.status,
        featured: campaignData.featured,
        urgencyLevel: campaignData.urgencyLevel,
        walletAddress: campaignData.walletAddress,
        createdAt: campaignData.createdAt,
        lastUpdated: campaignData.lastUpdated,
        beneficiaries: campaignData.beneficiaries,
        tags: campaignData.tags,
        updates: campaignData.updates,
        milestones: campaignData.milestones
      }
      
      const existingIndex = campaigns.findIndex(c => c.id === campaignData.id)
      if (existingIndex >= 0) {
        campaigns[existingIndex] = legacyFormat
      } else {
        campaigns.push(legacyFormat)
      }
      
      fs.writeFileSync(this.legacyFile, JSON.stringify(campaigns, null, 2))
      console.log(`📋 Updated legacy campaigns.json`)
      
    } catch (error) {
      console.error('Error updating legacy file:', error)
    }
  }

  // Public methods for external use
  async getCampaign(campaignId: string): Promise<CampaignData | null> {
    return await this.syncCampaignData(campaignId)
  }

  async addDonation(campaignId: string, donation: DonationRecord): Promise<boolean> {
    try {
      const campaignData = await this.syncCampaignData(campaignId)
      if (!campaignData) {
        return false
      }

      // Add donation (with deduplication)
      const existingIndex = campaignData.donations.findIndex(
        d => d.txHash === donation.txHash || d.id === donation.id
      )
      
      if (existingIndex >= 0) {
        // Update existing donation
        campaignData.donations[existingIndex] = {
          ...campaignData.donations[existingIndex],
          ...donation
        }
      } else {
        // Add new donation at the beginning
        campaignData.donations.unshift(donation)
      }
      
      // Recalculate stats
      campaignData.stats = this.calculateStats(campaignData.donations)
      campaignData.lastUpdated = new Date().toISOString()
      
      // Save updated data
      await this.saveCampaignData(campaignId, campaignData)
      
      console.log(`💰 Added/updated donation: ${donation.amount} SONIC for campaign ${campaignId}`)
      return true
      
    } catch (error) {
      console.error('Error adding donation:', error)
      return false
    }
  }

  async addUpdate(campaignId: string, update: any): Promise<boolean> {
    try {
      const campaignData = await this.syncCampaignData(campaignId)
      if (!campaignData) {
        return false
      }

      // Add update
      campaignData.updates.unshift(update)
      campaignData.lastUpdated = new Date().toISOString()
      
      // Save updated data
      await this.saveCampaignData(campaignId, campaignData)
      
      console.log(`📢 Added update to campaign ${campaignId}: ${update.title}`)
      return true
      
    } catch (error) {
      console.error('Error adding update:', error)
      return false
    }
  }
}

// Type definitions
interface CampaignData {
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
  beneficiaries: number
  tags: string[]
  imageUrl: string
  images: string[]
  startDate: string
  endDate: string
  stats: CampaignStats
  updates: any[]
  milestones: any[]
  reports: ReportRecord[]
  donations: DonationRecord[]
}

interface CampaignStats {
  totalDonations: number
  totalAmount: number
  confirmedAmount: number
  pendingAmount: number
  donorCount: number
  uniqueDonors: number
  lastDonationAt?: string
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

interface DataSources {
  comprehensive: CampaignData | null
  legacy: any
  donations: DonationRecord[]
  localStorage: any
}

// Export singleton instance
export const campaignManager = CampaignDataManager.getInstance()
export default CampaignDataManager