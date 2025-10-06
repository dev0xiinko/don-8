// Donation storage system for campaign transparency
export interface DonationRecord {
  id: string
  campaignId: string
  txHash: string
  amount: string
  currency: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  explorerUrl: string
  donorAddress: string
  message?: string
  anonymous: boolean
  confirmationTime?: Date
  networkName: string
}

export class DonationStorageManager {
  private static instance: DonationStorageManager
  
  static getInstance(): DonationStorageManager {
    if (!DonationStorageManager.instance) {
      DonationStorageManager.instance = new DonationStorageManager()
    }
    return DonationStorageManager.instance
  }

  // Save donation to campaign-specific JSON file
  async saveDonationRecord(donation: DonationRecord): Promise<void> {
    try {
      const campaignDonations = await this.getCampaignDonations(donation.campaignId)
      campaignDonations.unshift(donation) // Add to beginning for newest first
      
      // Save to localStorage for immediate access
      localStorage.setItem(`campaign_donations_${donation.campaignId}`, JSON.stringify(campaignDonations))
      
      // Save to JSON file for persistence
      await this.saveToJsonFile(donation.campaignId, campaignDonations)
      
      // Update campaign raised amount
      await this.updateCampaignRaisedAmount(donation.campaignId)
      
      console.log(`Donation saved for campaign ${donation.campaignId}:`, donation)
    } catch (error) {
      console.error('Error saving donation record:', error)
    }
  }

  // Update existing donation status
  async updateDonationStatus(
    campaignId: string, 
    txHash: string, 
    status: 'confirmed' | 'failed',
    additionalData?: { blockNumber?: number; gasUsed?: string; confirmationTime?: Date }
  ): Promise<void> {
    try {
      const donations = await this.getCampaignDonations(campaignId)
      const donationIndex = donations.findIndex(d => d.txHash === txHash)
      
      if (donationIndex !== -1) {
        donations[donationIndex] = {
          ...donations[donationIndex],
          status,
          ...additionalData,
          confirmationTime: additionalData?.confirmationTime || new Date()
        }
        
        localStorage.setItem(`campaign_donations_${campaignId}`, JSON.stringify(donations))
        
        // Save to JSON file for persistence
        await this.saveToJsonFile(campaignId, donations)
        
        // Update campaign raised amount if confirmed
        if (status === 'confirmed') {
          await this.updateCampaignRaisedAmount(campaignId)
        }
        
        console.log(`Donation status updated for ${txHash}: ${status}`)
      }
    } catch (error) {
      console.error('Error updating donation status:', error)
    }
  }

  // Get all donations for a campaign
  async getCampaignDonations(campaignId: string, forceRefresh = false): Promise<DonationRecord[]> {
    try {
      if (forceRefresh) {
        return await this.forceRefreshFromServer(campaignId)
      }
      
      // Try to load from JSON file first (most persistent)
      const fileData = await this.loadFromJsonFile(campaignId)
      if (fileData.length > 0) {
        return fileData
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem(`campaign_donations_${campaignId}`)
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
          confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
        }))
      }
      return []
    } catch (error) {
      console.error('Error loading campaign donations:', error)
      return []
    }
  }

  // Get donation statistics for a campaign
  async getCampaignStats(campaignId: string): Promise<{
    totalDonations: number
    totalAmount: number
    confirmedDonations: number
    pendingDonations: number
    uniqueDonors: number
  }> {
    const donations = await this.getCampaignDonations(campaignId)
    const confirmed = donations.filter(d => d.status === 'confirmed')
    const pending = donations.filter(d => d.status === 'pending')
    const uniqueDonors = new Set(donations.map(d => d.anonymous ? 'anonymous' : d.donorAddress)).size

    return {
      totalDonations: donations.length,
      totalAmount: confirmed.reduce((sum, d) => sum + parseFloat(d.amount), 0),
      confirmedDonations: confirmed.length,
      pendingDonations: pending.length,
      uniqueDonors
    }
  }

  // Clear all donations for a campaign (admin function)
  async clearCampaignDonations(campaignId: string): Promise<void> {
    localStorage.removeItem(`campaign_donations_${campaignId}`)
  }

  // Export campaign donations as JSON
  async exportCampaignDonations(campaignId: string): Promise<string> {
    const donations = await this.getCampaignDonations(campaignId)
    return JSON.stringify(donations, null, 2)
  }

  // Save donations to JSON file via API
  private async saveToJsonFile(campaignId: string, donations: DonationRecord[]): Promise<void> {
    try {
      // Save to API endpoint for server-side persistence
      const response = await fetch(`/api/donations/${campaignId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ donations })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save to server')
      }
      
      // Also keep local backup
      const jsonData = JSON.stringify(donations, null, 2)
      localStorage.setItem(`campaign_donations_file_${campaignId}`, jsonData)
      localStorage.setItem(`campaign_donations_file_${campaignId}_timestamp`, new Date().toISOString())
      
      // Save backup with timestamp
      const backupKey = `campaign_donations_backup_${campaignId}_${Date.now()}`
      localStorage.setItem(backupKey, jsonData)
      
      // Keep only last 5 backups to prevent storage overflow
      this.cleanupBackups(campaignId)
      
      console.log(`Donations saved to server for campaign ${campaignId}`)
    } catch (error) {
      console.error('Error saving to JSON file:', error)
      // Fallback to localStorage only
      const jsonData = JSON.stringify(donations, null, 2)
      localStorage.setItem(`campaign_donations_file_${campaignId}`, jsonData)
    }
  }

  // Load donations from JSON file via API
  private async loadFromJsonFile(campaignId: string): Promise<DonationRecord[]> {
    try {
      // Try to load from server first
      const response = await fetch(`/api/donations/${campaignId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.donations) {
          return result.donations.map((d: any) => ({
            ...d,
            timestamp: new Date(d.timestamp),
            confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
          }))
        }
      }
    } catch (error) {
      console.error('Error loading from server, trying localStorage:', error)
    }
    
    // Fallback to localStorage
    try {
      const jsonData = localStorage.getItem(`campaign_donations_file_${campaignId}`)
      if (jsonData) {
        const parsed = JSON.parse(jsonData)
        return parsed.map((d: any) => ({
          ...d,
          timestamp: new Date(d.timestamp),
          confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
        }))
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error)
    }
    return []
  }

  // Update campaign raised amount (now handled by API)
  private async updateCampaignRaisedAmount(campaignId: string): Promise<void> {
    // Campaign amounts are now updated automatically by the API when donations are saved
    console.log(`Campaign ${campaignId} amount will be updated by server`)
  }

  // Get campaigns data from localStorage or mock
  private getCampaignsData(): any[] {
    try {
      const stored = localStorage.getItem('campaigns_data')
      if (stored) {
        return JSON.parse(stored)
      }
      
      // Fallback to mock data if no stored data
      const mockData = localStorage.getItem('mock_campaigns')
      if (mockData) {
        const campaigns = JSON.parse(mockData)
        localStorage.setItem('campaigns_data', JSON.stringify(campaigns))
        return campaigns
      }
    } catch (error) {
      console.error('Error getting campaigns data:', error)
    }
    return []
  }

  // Cleanup old backups
  private cleanupBackups(campaignId: string): void {
    try {
      const keys = Object.keys(localStorage)
      const backupKeys = keys
        .filter(key => key.startsWith(`campaign_donations_backup_${campaignId}_`))
        .sort()
      
      // Keep only the last 5 backups
      if (backupKeys.length > 5) {
        const keysToDelete = backupKeys.slice(0, backupKeys.length - 5)
        keysToDelete.forEach(key => localStorage.removeItem(key))
      }
    } catch (error) {
      console.error('Error cleaning up backups:', error)
    }
  }

  // Get file save timestamp
  getLastSaveTime(campaignId: string): Date | null {
    try {
      const timestamp = localStorage.getItem(`campaign_donations_file_${campaignId}_timestamp`)
      return timestamp ? new Date(timestamp) : null
    } catch (error) {
      return null
    }
  }

  // Force refresh from server
  async forceRefreshFromServer(campaignId: string): Promise<DonationRecord[]> {
    try {
      const response = await fetch(`/api/donations/${campaignId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.donations) {
          const donations = result.donations.map((d: any) => ({
            ...d,
            timestamp: new Date(d.timestamp),
            confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
          }))
          
          // Update localStorage cache
          localStorage.setItem(`campaign_donations_${campaignId}`, JSON.stringify(donations))
          localStorage.setItem(`campaign_donations_file_${campaignId}`, JSON.stringify(donations, null, 2))
          localStorage.setItem(`campaign_donations_file_${campaignId}_timestamp`, new Date().toISOString())
          
          return donations
        }
      }
    } catch (error) {
      console.error('Error refreshing from server:', error)
    }
    return []
  }

  // Get all donations across all campaigns for global history
  async getAllDonations(): Promise<DonationRecord[]> {
    try {
      // Try to fetch from API first for most up-to-date data
      const response = await fetch('/api/donations/global')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.donations) {
          return result.donations.map((d: any) => ({
            ...d,
            timestamp: new Date(d.timestamp),
            confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
          }))
        }
      }
      
      // Fallback to localStorage
      const allDonations: DonationRecord[] = []
      
      // Get all campaign donation keys from localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('campaign_donations_') && !key.includes('_file_') && !key.includes('_timestamp')) {
          const stored = localStorage.getItem(key)
          if (stored) {
            const parsed = JSON.parse(stored)
            const donations = parsed.map((d: any) => ({
              ...d,
              timestamp: new Date(d.timestamp),
              confirmationTime: d.confirmationTime ? new Date(d.confirmationTime) : undefined
            }))
            allDonations.push(...donations)
          }
        }
      }
      
      // Sort by timestamp (newest first)
      allDonations.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      return allDonations
    } catch (error) {
      console.error('Error loading all donations:', error)
      return []
    }
  }

  // Get aggregated statistics across all campaigns
  async getGlobalStats(): Promise<{
    totalDonations: number
    totalAmount: number
    confirmedDonations: number
    pendingDonations: number
    uniqueDonors: number
    uniqueCampaigns: number
  }> {
    try {
      // Try to get stats from API first
      const response = await fetch('/api/donations/global')
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.stats) {
          return result.stats
        }
      }
      
      // Fallback to calculating from getAllDonations
      const allDonations = await this.getAllDonations()
      const confirmed = allDonations.filter(d => d.status === 'confirmed')
      const pending = allDonations.filter(d => d.status === 'pending')
      const uniqueDonors = new Set(allDonations.map(d => d.anonymous ? 'anonymous' : d.donorAddress)).size
      const uniqueCampaigns = new Set(allDonations.map(d => d.campaignId)).size

      return {
        totalDonations: allDonations.length,
        totalAmount: confirmed.reduce((sum, d) => sum + parseFloat(d.amount), 0),
        confirmedDonations: confirmed.length,
        pendingDonations: pending.length,
        uniqueDonors,
        uniqueCampaigns
      }
    } catch (error) {
      console.error('Error getting global stats:', error)
      return {
        totalDonations: 0,
        totalAmount: 0,
        confirmedDonations: 0,
        pendingDonations: 0,
        uniqueDonors: 0,
        uniqueCampaigns: 0
      }
    }
  }
}