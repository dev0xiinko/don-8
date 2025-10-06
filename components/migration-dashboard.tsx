"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  RefreshCw, 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Upload,
  Loader2
} from 'lucide-react'

interface MigrationStats {
  jsonFiles: number
  totalJsonDonations: number
  donationsDirectory: string
}

interface LocalStorageStats {
  walletCount: number
  totalLocalDonations: number
  keys: string[]
}

export default function MigrationDashboard() {
  const [migrationStats, setMigrationStats] = useState<MigrationStats | null>(null)
  const [localStorageStats, setLocalStorageStats] = useState<LocalStorageStats>({ walletCount: 0, totalLocalDonations: 0, keys: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)
  const [migrationResult, setMigrationResult] = useState<string>('')

  const checkMigrationStatus = async () => {
    try {
      setIsLoading(true)
      
      // Get server-side migration stats
      const response = await fetch('/api/donations/migrate')
      const result = await response.json()
      
      if (result.success) {
        setMigrationStats(result.migration)
      }

      // Check localStorage stats
      const localKeys = []
      let totalLocal = 0
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('donation_history_')) {
          localKeys.push(key)
          
          try {
            const stored = localStorage.getItem(key)
            if (stored) {
              const parsed = JSON.parse(stored)
              if (Array.isArray(parsed)) {
                totalLocal += parsed.length
              }
            }
          } catch (error) {
            console.error('Error parsing localStorage key:', key, error)
          }
        }
      }

      setLocalStorageStats({
        walletCount: localKeys.length,
        totalLocalDonations: totalLocal,
        keys: localKeys
      })

    } catch (error) {
      console.error('Error checking migration status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const runManualMigration = async () => {
    try {
      setIsMigrating(true)
      setMigrationResult('')

      if (localStorageStats.totalLocalDonations === 0) {
        setMigrationResult('No localStorage donations found to migrate')
        return
      }

      // Collect all donations from localStorage
      const allDonations: any[] = []
      const donationsByCampaign: { [key: string]: any[] } = {}

      for (const key of localStorageStats.keys) {
        try {
          const walletAddress = key.replace('donation_history_', '')
          const stored = localStorage.getItem(key)
          
          if (stored) {
            const parsed = JSON.parse(stored)
            const donations = parsed.map((item: any) => ({
              ...item,
              timestamp: new Date(item.timestamp),
              donorAddress: walletAddress
            }))
            
            allDonations.push(...donations)
          }
        } catch (error) {
          console.error('Error processing localStorage key:', key, error)
        }
      }

      // Group by campaign (use 'legacy_donations' as default)
      allDonations.forEach(donation => {
        const campaignId = donation.campaignId || 'legacy_donations'
        
        if (!donationsByCampaign[campaignId]) {
          donationsByCampaign[campaignId] = []
        }
        
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
          donorAddress: donation.donorAddress,
          message: donation.message || '',
          anonymous: donation.anonymous || false,
          networkName: donation.networkName || 'Sonic Blaze Testnet'
        }
        
        donationsByCampaign[campaignId].push(donationRecord)
      })

      // Migrate each campaign
      let totalMigrated = 0
      let errors = 0

      for (const [campaignId, donations] of Object.entries(donationsByCampaign)) {
        try {
          const response = await fetch('/api/donations/migrate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId, donations })
          })
          
          const result = await response.json()
          
          if (result.success) {
            totalMigrated += donations.length
          } else {
            errors++
          }
        } catch (error) {
          errors++
          console.error('Error migrating campaign:', campaignId, error)
        }
      }

      // Clear localStorage if successful
      if (errors === 0) {
        for (const key of localStorageStats.keys) {
          localStorage.removeItem(key)
        }
        setMigrationResult(`✅ Successfully migrated ${totalMigrated} donations and cleared localStorage`)
      } else {
        setMigrationResult(`⚠️ Migrated ${totalMigrated} donations with ${errors} errors. Check console for details.`)
      }

      // Refresh stats after migration
      setTimeout(() => {
        checkMigrationStatus()
      }, 1000)

    } catch (error) {
      console.error('Manual migration error:', error)
      setMigrationResult(`❌ Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsMigrating(false)
    }
  }

  useEffect(() => {
    checkMigrationStatus()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Checking migration status...</span>
        </CardContent>
      </Card>
    )
  }

  const needsMigration = localStorageStats.totalLocalDonations > 0
  const migrationComplete = !needsMigration && migrationStats && migrationStats.totalJsonDonations > 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Migration Status
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={checkMigrationStatus}
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            {needsMigration && (
              <Button 
                size="sm"
                onClick={runManualMigration}
                disabled={isMigrating}
              >
                {isMigrating ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Migrating...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-1" />Migrate Now</>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Migration Status Alert */}
          {migrationComplete && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4" />
              <AlertDescription className="text-green-800">
                Migration complete! All donations are now stored in the JSON system.
              </AlertDescription>
            </Alert>
          )}
          
          {needsMigration && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-orange-800">
                Found {localStorageStats.totalLocalDonations} donations in localStorage that need migration.
              </AlertDescription>
            </Alert>
          )}

          {!needsMigration && (!migrationStats || migrationStats.totalJsonDonations === 0) && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-blue-800">
                No donations found in either localStorage or JSON files.
              </AlertDescription>
            </Alert>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* localStorage Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">localStorage Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Wallet Addresses:</span>
                    <Badge variant={localStorageStats.walletCount > 0 ? "default" : "secondary"}>
                      {localStorageStats.walletCount}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Donations:</span>
                    <Badge variant={localStorageStats.totalLocalDonations > 0 ? "default" : "secondary"}>
                      {localStorageStats.totalLocalDonations}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* JSON Files Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">JSON Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Campaign Files:</span>
                    <Badge variant={migrationStats?.jsonFiles ? "default" : "secondary"}>
                      {migrationStats?.jsonFiles || 0}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Donations:</span>
                    <Badge variant={migrationStats?.totalJsonDonations ? "default" : "secondary"}>
                      {migrationStats?.totalJsonDonations || 0}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Migration Result */}
          {migrationResult && (
            <Alert className={migrationResult.startsWith('✅') ? "border-green-200 bg-green-50" : 
                             migrationResult.startsWith('⚠️') ? "border-orange-200 bg-orange-50" : 
                             "border-red-200 bg-red-50"}>
              <AlertDescription className={migrationResult.startsWith('✅') ? "text-green-800" : 
                                          migrationResult.startsWith('⚠️') ? "text-orange-800" : 
                                          "text-red-800"}>
                {migrationResult}
              </AlertDescription>
            </Alert>
          )}

          {/* localStorage Details */}
          {localStorageStats.keys.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">localStorage Keys Found:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs font-mono space-y-1 max-h-24 overflow-y-auto">
                {localStorageStats.keys.map(key => (
                  <div key={key} className="text-gray-700">
                    {key}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}