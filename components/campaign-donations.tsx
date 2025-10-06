import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  ExternalLink, 
  RefreshCw, 
  Heart, 
  TrendingUp, 
  Clock,
  CheckCircle,
  XCircle,
  Users,
  DollarSign
} from "lucide-react"
// Remove legacy donation storage import
interface DonationRecord {
  id: string
  txHash: string
  amount: string
  currency: string
  timestamp: string
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  explorerUrl: string
  donorAddress: string
  message?: string
  anonymous?: boolean
  networkName?: string
  confirmationTime?: string
}

interface CampaignDonationsProps {
  campaignId: string
  refreshKey?: number
  onTotalUpdate?: (total: number) => void
}

export function CampaignDonations({ campaignId, refreshKey, onTotalUpdate }: CampaignDonationsProps) {
  const [donations, setDonations] = useState<DonationRecord[]>([])
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalAmount: 0,
    confirmedDonations: 0,
    pendingDonations: 0,
    uniqueDonors: 0,
    totalSonic: 0
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadDonations = async (forceRefresh = false) => {
    try {
      console.log(`🔄 Loading donations from comprehensive API for campaign ${campaignId}`, forceRefresh ? '(force refresh)' : '')
      
      // Fetch from comprehensive campaign API for accurate, real-time data
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const result = await response.json()
      
      if (result.success && result.campaign) {
        const campaignData = result.campaign
        const campaignDonations = campaignData.donations || []
        const campaignStats = campaignData.stats || {}
        
        console.log(`✅ Loaded ${campaignDonations.length} donations from comprehensive API`)
        console.log(`💰 Confirmed amount: ${campaignStats.confirmedAmount || 0} SONIC`)
        
        // Calculate real-time stats from fresh data
        const confirmedDonations = campaignDonations.filter((d: any) => d.status === 'confirmed')
        const pendingDonations = campaignDonations.filter((d: any) => d.status === 'pending')
        const uniqueDonors = new Set(campaignDonations.map((d: any) => d.donorAddress?.toLowerCase()).filter(Boolean)).size
        const totalSonic = campaignStats.confirmedAmount || 0
        
        setDonations(campaignDonations)
        setStats({
          totalDonations: campaignDonations.length,
          totalAmount: totalSonic,
          confirmedDonations: confirmedDonations.length,
          pendingDonations: pendingDonations.length,
          uniqueDonors,
          totalSonic
        })
        
        // Notify parent component of accurate total
        if (onTotalUpdate) {
          onTotalUpdate(totalSonic)
        }
        
        console.log(`📊 Updated stats:`, {
          total: campaignDonations.length,
          confirmed: confirmedDonations.length,
          pending: pendingDonations.length,
          totalSonic: totalSonic.toFixed(4),
          uniqueDonors
        })
        
      } else {
        console.error('❌ Failed to load campaign data:', result.error)
      }
      
    } catch (error) {
      console.error('❌ Error loading donations from API:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDonations(true) // Force refresh from server
  }

  useEffect(() => {
    loadDonations()
    
    // Auto-refresh every 5 seconds for real-time updates
    const interval = setInterval(() => loadDonations(false), 5000)
    return () => clearInterval(interval)
  }, [campaignId, refreshKey])
  
  // Force refresh when refreshKey changes (indicates new donation)
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      console.log('🔄 Force refreshing due to refreshKey change:', refreshKey)
      loadDonations(true)
    }
  }, [refreshKey])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin" />
            <p className="text-sm text-gray-500">Loading donations...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Donation Transparency
            </span>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Main Total SONIC Display */}
          <div className="mb-6 p-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {stats.totalSonic.toFixed(4)} SONIC
              </div>
              <div className="text-green-100 text-lg">
                Total Raised from {stats.totalDonations} Donations
              </div>
              <div className="text-green-200 text-sm mt-2">
                Real-time blockchain transparency • Updated every confirmation
              </div>
            </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-bold text-green-600">{stats.confirmedDonations}</div>
              <div className="text-xs text-gray-600">Confirmed</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-xl font-bold text-yellow-600">{stats.pendingDonations}</div>
              <div className="text-xs text-gray-600">{stats.pendingDonations > 0 ? 'Processing' : 'Pending'}</div>
              {stats.pendingDonations > 0 && (
                <div className="flex items-center justify-center mt-1">
                  <Clock className="w-3 h-3 animate-pulse text-yellow-600" />
                </div>
              )}
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-xl font-bold text-purple-600">{stats.uniqueDonors}</div>
              <div className="text-xs text-gray-600">Unique Donors</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-xl font-bold text-blue-600">{(stats.totalSonic / (stats.totalDonations || 1)).toFixed(4)}</div>
              <div className="text-xs text-gray-600">Avg Donation</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            All Donations ({donations.length})
          </CardTitle>
          <p className="text-sm text-gray-500">
            Real-time donation tracking with server persistence • Updates automatically
          </p>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No donations yet</p>
              <p className="text-xs mt-1">Be the first to support this campaign!</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  All transactions verified on blockchain • Stored in JSON files
                </div>
                <div className="flex items-center gap-2">
                  <span>Last updated: {new Date().toLocaleTimeString()}</span>
                  {refreshing && <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />}
                  <span className="text-xs text-green-600">• Synced with server</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-gray-50">
                    <tr>
                      <th className="text-left p-3 font-semibold">Donor</th>
                      <th className="text-left p-3 font-semibold">Amount</th>
                      <th className="text-left p-3 font-semibold">Status</th>
                      <th className="text-left p-3 font-semibold">Time</th>
                      <th className="text-left p-3 font-semibold">Transaction</th>
                      <th className="text-left p-3 font-semibold">Network</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.map((donation, index) => (
                      <tr key={donation.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-xs">
                              {donation.anonymous 
                                ? "Anonymous" 
                                : `${donation.donorAddress.slice(0, 6)}...${donation.donorAddress.slice(-4)}`
                              }
                            </span>
                          </div>
                          {donation.message && (
                            <div className="text-xs text-gray-500 mt-1 italic max-w-32 truncate" title={donation.message}>
                              "{donation.message}"
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-600" />
                            <span className="font-bold">{donation.amount} {donation.currency}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <Badge 
                              variant={
                                donation.status === 'confirmed' ? 'default' : 
                                donation.status === 'pending' ? 'secondary' : 
                                'destructive'
                              }
                              className="text-xs flex items-center gap-1"
                            >
                              {donation.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                              {donation.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                              {donation.status === 'failed' && <XCircle className="w-3 h-3" />}
                              {donation.status === 'confirmed' ? 'Confirmed' : 
                               donation.status === 'pending' ? 'Processing...' : 'Failed'}
                            </Badge>
                            {donation.status === 'confirmed' && donation.confirmationTime && (
                              <div className="text-xs text-green-600">
                                Confirmed {new Date(donation.confirmationTime).toLocaleTimeString()}
                              </div>
                            )}
                            {donation.status === 'pending' && (
                              <div className="text-xs text-orange-600 animate-pulse">
                                Awaiting blockchain confirmation
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs">
                            <div className="font-medium">{new Date(donation.timestamp).toLocaleDateString()}</div>
                            <div className="text-gray-500">{new Date(donation.timestamp).toLocaleTimeString()}</div>
                            {donation.blockNumber && (
                              <div className="text-gray-400 mt-1">Block: {donation.blockNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <div className="font-mono text-xs text-gray-600 max-w-24 truncate" title={donation.txHash}>
                              {donation.txHash.slice(0, 8)}...{donation.txHash.slice(-6)}
                            </div>
                            <a 
                              href={donation.explorerUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              View
                            </a>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-xs text-gray-600">{donation.networkName}</div>
                          {donation.gasUsed && (
                            <div className="text-xs text-gray-400">Gas: {donation.gasUsed}</div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {donations.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-xs text-gray-500">
                    Showing {donations.length} donations • All stored in persistent JSON files
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}