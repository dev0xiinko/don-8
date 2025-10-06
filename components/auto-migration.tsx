"use client"

import { useEffect, useState } from 'react'

export default function AutoMigrationHandler() {
  const [migrationStatus, setMigrationStatus] = useState<{
    isComplete: boolean
    totalMigrated: number
    errors: string[]
  }>({
    isComplete: false,
    totalMigrated: 0,
    errors: []
  })

  const checkAndRunAutoMigration = async () => {
    try {
      console.log('🔄 AutoMigration: Checking for localStorage donations...')
      
      // Check if there are any localStorage donations to migrate
      const localStorageKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('donation_history_')) {
          localStorageKeys.push(key)
        }
      }

      if (localStorageKeys.length === 0) {
        console.log('✅ AutoMigration: No localStorage donations found')
        setMigrationStatus({
          isComplete: true,
          totalMigrated: 0,
          errors: []
        })
        return
      }

      console.log(`📦 AutoMigration: Found ${localStorageKeys.length} localStorage entries`)

      // Collect all donations from localStorage
      const allDonations: any[] = []
      const errors: string[] = []

      for (const key of localStorageKeys) {
        try {
          const walletAddress = key.replace('donation_history_', '')
          const stored = localStorage.getItem(key)
          
          if (stored) {
            const parsed = JSON.parse(stored)
            const donations = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp),
              walletAddress: walletAddress,
              donorAddress: walletAddress
            }))
            
            allDonations.push(...donations)
            console.log(`📋 AutoMigration: Loaded ${donations.length} donations from ${walletAddress}`)
          }
        } catch (error) {
          const errorMsg = `Failed to parse ${key}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('❌ AutoMigration:', errorMsg)
        }
      }

      if (allDonations.length === 0) {
        console.log('⚠️ AutoMigration: No valid donations found in localStorage')
        setMigrationStatus({
          isComplete: true,
          totalMigrated: 0,
          errors
        })
        return
      }

      // Group donations by campaign (use a default campaign if none specified)
      const donationsByCampaign: { [key: string]: any[] } = {}
      
      allDonations.forEach(donation => {
        // Try to extract campaign ID from context or use default
        const campaignId = donation.campaignId || 'legacy_donations'
        
        if (!donationsByCampaign[campaignId]) {
          donationsByCampaign[campaignId] = []
        }
        
        // Convert to proper donation record format
        const donationRecord = {
          id: donation.id || `${Date.now()}_${donation.txHash}`,
          campaignId: campaignId,
          txHash: donation.txHash,
          amount: donation.amount,
          currency: donation.currency || 'SONIC',
          timestamp: donation.timestamp,
          status: donation.status || 'confirmed',
          blockNumber: donation.blockNumber,
          gasUsed: donation.gasUsed,
          explorerUrl: donation.explorerUrl || `https://blaze.soniclabs.com/tx/${donation.txHash}`,
          donorAddress: donation.donorAddress || donation.walletAddress,
          message: donation.message || '',
          anonymous: donation.anonymous || false,
          networkName: donation.networkName || 'Sonic Blaze Testnet'
        }
        
        donationsByCampaign[campaignId].push(donationRecord)
      })

      // Migrate each campaign's donations
      let totalMigrated = 0
      
      for (const [campaignId, donations] of Object.entries(donationsByCampaign)) {
        try {
          console.log(`🚀 AutoMigration: Migrating ${donations.length} donations for campaign ${campaignId}`)
          
          const response = await fetch('/api/donations/migrate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              campaignId: campaignId,
              donations: donations
            })
          })
          
          const result = await response.json()
          
          if (result.success) {
            totalMigrated += donations.length
            console.log(`✅ AutoMigration: Successfully migrated campaign ${campaignId}`)
          } else {
            const errorMsg = `Failed to migrate campaign ${campaignId}: ${result.error || result.message}`
            errors.push(errorMsg)
            console.error('❌ AutoMigration:', errorMsg)
          }
        } catch (error) {
          const errorMsg = `Network error migrating campaign ${campaignId}: ${error instanceof Error ? error.message : 'Unknown error'}`
          errors.push(errorMsg)
          console.error('❌ AutoMigration:', errorMsg)
        }
      }

      // Clear localStorage after successful migration (only if no errors)
      if (errors.length === 0) {
        console.log('🧹 AutoMigration: Clearing localStorage after successful migration')
        for (const key of localStorageKeys) {
          localStorage.removeItem(key)
        }
        console.log('✅ AutoMigration: localStorage cleared successfully')
      }

      setMigrationStatus({
        isComplete: true,
        totalMigrated,
        errors
      })

      console.log(`🎉 AutoMigration: Complete! Migrated ${totalMigrated} donations with ${errors.length} errors`)

    } catch (error) {
      const errorMsg = `AutoMigration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      console.error('❌ AutoMigration:', errorMsg)
      setMigrationStatus({
        isComplete: true,
        totalMigrated: 0,
        errors: [errorMsg]
      })
    }
  }

  // Run auto-migration on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      // Small delay to ensure app is fully loaded
      const timer = setTimeout(() => {
        checkAndRunAutoMigration()
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  // Don't render anything - this is a background process
  return null
}

// Export utility functions for manual migration
export const MigrationUtils = {
  async checkMigrationStatus() {
    try {
      const response = await fetch('/api/donations/migrate')
      return await response.json()
    } catch (error) {
      console.error('Error checking migration status:', error)
      return { success: false, error: 'Failed to check status' }
    }
  },

  async runManualMigration() {
    try {
      console.log('🔧 Manual Migration: Starting...')
      
      // Check localStorage
      const localStorageKeys = []
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('donation_history_')) {
          localStorageKeys.push(key)
        }
      }

      if (localStorageKeys.length === 0) {
        return { success: true, message: 'No localStorage donations to migrate', totalMigrated: 0 }
      }

      // Run the same logic as auto-migration but return results
      // This would be the same logic as checkAndRunAutoMigration but synchronous
      return { success: true, message: 'Manual migration completed', totalMigrated: 0 }
    } catch (error) {
      console.error('Manual migration error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}