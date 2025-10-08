"use client"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { 
  ArrowLeft, Heart, MapPin, CheckCircle, ExternalLink, Clock, DollarSign, RefreshCw, FileText, Facebook, Twitter, Users, Calendar, History
} from "lucide-react"
import { SafeImage } from "@/components/ui/safe-image"
import { CampaignDonations } from "@/components/campaign-donations"
import { DonorCampaignUpdates } from "@/components/donor-campaign-updates"
import { CampaignReports } from "@/components/campaign-reports"

interface DonationHistory {
  id: string
  txHash: string
  amount: string
  currency: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  blockNumber?: number
  gasUsed?: string
  explorerUrl: string
  walletAddress?: string
  type?: 'donation' | 'withdrawal'
  destination?: string
}

interface NetworkInfo {
  chainId: number
  name: string
  currency: string
  explorer: string
  rpcUrl: string
}

// Force-only Sonic Blaze Testnet
const SUPPORTED_NETWORKS: { [key: number]: NetworkInfo } = {
  64165: { chainId: 64165, name: 'Sonic Blaze Testnet', currency: 'SONIC', explorer: 'https://blaze.soniclabs.com', rpcUrl: 'https://rpc.blaze.soniclabs.com' }
}

// Ensure wallet is on Sonic Blaze Testnet (64165 / 0xFAA5).
// We ONLY switch if needed; we do not attempt to add the chain.
const ensureSonicNetwork = async (): Promise<NetworkInfo | null> => {
  if (typeof window === 'undefined' || !(window as any).ethereum) return SUPPORTED_NETWORKS[64165]
  const ethereum = (window as any).ethereum
  const sonic = SUPPORTED_NETWORKS[64165]
  const sonicHex = '0xFAA5' // 64165

  try {
    // Only switch if not already on Sonic
    const currentChainId = await ethereum.request({ method: 'eth_chainId' })
    if (String(currentChainId).toLowerCase() !== sonicHex.toLowerCase()) {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sonicHex }]
      })
    }
  } catch (switchErr: any) {
    console.error('Failed to switch to Sonic Blaze Testnet (no add attempt):', switchErr)
    return null
  }
  return sonic
}

export default function DonatePage() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [balance, setBalance] = useState<string>("0.0")
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(null)
  const [txHash, setTxHash] = useState<string>("")
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [donationData, setDonationData] = useState({ amount: "", message: "", anonymous: false })
  const [step, setStep] = useState(1)
  const [showPopup, setShowPopup] = useState(false)
  const [campaign, setCampaign] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [campaignDonationsRefresh, setCampaignDonationsRefresh] = useState(0)
  const [realTimeDonationTotal, setRealTimeDonationTotal] = useState(0)
  const [campaignRefreshKey, setCampaignRefreshKey] = useState(0)
  const [lastUpdatedTimestamp, setLastUpdatedTimestamp] = useState<string>('')
  const txStatusPollingRef = useRef<NodeJS.Timeout | null>(null)
  const campaignPollingRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingCampaignRef = useRef<boolean>(false)
  const lastFetchAtRef = useRef<number>(0)
  const isPageVisibleRef = useRef<boolean>(typeof document !== 'undefined' ? !document.hidden : true)
  // Track previous donation metrics to auto-refresh transparency list when others donate
  const prevDonationsCountRef = useRef<number>(0)
  const prevConfirmedAmountRef = useRef<number>(0)
  const params = useParams()
  const campaignId = params.id

  // Fetch comprehensive campaign data from unified API
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        console.log('🔄 Loading comprehensive campaign data for ID:', campaignId)
        
        // Reset state
        setRealTimeDonationTotal(0)
        setDonationHistory([])
        
        // Fetch comprehensive campaign data (includes donations)
        const response = await fetch(`/api/campaigns/${campaignId}`)
        const result = await response.json()
        
        if (result.success && result.campaign) {
          const campaignData = result.campaign
          console.log('✅ Loaded comprehensive campaign:', campaignData.title)
          console.log('📦 Contains', campaignData.donations.length, 'donations')
          console.log('💰 Confirmed amount:', campaignData.stats.confirmedAmount, 'SONIC')
          
          setCampaign(campaignData)
          
          // Set real-time total from comprehensive data
          setRealTimeDonationTotal(campaignData.stats.confirmedAmount || 0)
          
          // Initialize timestamp for update monitoring
          setLastUpdatedTimestamp(campaignData.lastUpdated || '')
          
          // Load donation history from comprehensive data
          loadDonationHistoryFromCampaignData(campaignData)

          // Initialize previous donation metrics for change detection
          prevDonationsCountRef.current = (campaignData.donations || []).length
          prevConfirmedAmountRef.current = campaignData.stats?.confirmedAmount || 0
          
        } else {
          console.error('❌ Failed to load campaign:', result.error)
        }
      } catch (error) {
        console.error('❌ Error fetching campaign:', error)
      } finally {
        setLoading(false)
      }
    }

    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])





  // Process donation history and withdrawal history from comprehensive campaign data
  const loadDonationHistoryFromCampaignData = async (campaignData: any) => {
    try {
      console.log('📊 Processing donation and withdrawal history from campaign data...')
      
      const allDonations = campaignData.donations || []
      console.log('📦 Campaign contains', allDonations.length, 'total donations')
      
      // Fetch NGO withdrawals for this campaign's NGO
      let ngoWithdrawals: any[] = []
      try {
        const withdrawalResponse = await fetch(`/api/ngo/withdrawals?ngoId=${campaign.ngoId}`)
        const withdrawalResult = await withdrawalResponse.json()
        if (withdrawalResult.success) {
          ngoWithdrawals = withdrawalResult.withdrawals || []
          console.log('💰 Found', ngoWithdrawals.length, 'NGO withdrawals')
          // Debug: log withdrawal statuses to help identify mapping issues
          ngoWithdrawals.forEach((w: any, i: number) => {
            console.log(`Withdrawal ${i}: status="${w.status}", txHash="${w.txHash}"`)
          })
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch NGO withdrawals:', error)
      }
      
      // Filter donations for current wallet if connected, otherwise show all
      let filteredDonations = allDonations
      if (walletConnected && userAddress) {
        filteredDonations = allDonations.filter((d: any) => 
          d.donorAddress && d.donorAddress.toLowerCase() === userAddress.toLowerCase()
        )
        console.log('🔍 Filtered', filteredDonations.length, 'donations for wallet', userAddress)
      } else {
        console.log('👁️ Showing all', allDonations.length, 'donations (wallet not connected)')
      }
      
      // Convert donations to DonationHistory format
      const donationHistoryData: DonationHistory[] = filteredDonations.map((d: any) => ({
        id: d.id,
        txHash: d.txHash,
        amount: d.amount,
        currency: d.currency,
        timestamp: new Date(d.timestamp),
        status: d.status,
        blockNumber: d.blockNumber,
        gasUsed: d.gasUsed,
        explorerUrl: d.explorerUrl,
        walletAddress: d.donorAddress,
        type: 'donation' as const
      }))
      
      // Convert withdrawals to DonationHistory format (show all withdrawals for transparency)
      const withdrawalHistoryData: DonationHistory[] = ngoWithdrawals.map((w: any) => {
        // Normalize withdrawal status - withdrawals are typically completed if they have a txHash
        let normalizedStatus: 'pending' | 'confirmed' | 'failed' = 'confirmed'
        if (w.status) {
          const statusLower = w.status.toLowerCase()
          if (statusLower === 'pending' || statusLower === 'processing') {
            normalizedStatus = 'pending'
          } else if (statusLower === 'failed' || statusLower === 'error' || statusLower === 'rejected') {
            normalizedStatus = 'failed'
          } else if (statusLower === 'completed' || statusLower === 'confirmed' || statusLower === 'success' || statusLower === 'successful') {
            normalizedStatus = 'confirmed'
          } else if (w.txHash) {
            // If we have a txHash, assume it's confirmed
            normalizedStatus = 'confirmed'
          }
        } else if (w.txHash) {
          // No explicit status but has txHash - assume confirmed
          normalizedStatus = 'confirmed'
        }

        return {
          id: `withdrawal_${w.id}`,
          txHash: w.txHash,
          amount: w.amount,
          currency: w.currency || 'SONIC',
          timestamp: new Date(w.date || w.timestamp || w.createdAt),
          status: normalizedStatus,
          blockNumber: w.blockNumber,
          gasUsed: w.gasUsed,
          explorerUrl: w.explorerUrl || `https://blaze.soniclabs.com/tx/${w.txHash}`,
          walletAddress: campaign.walletAddress, // NGO wallet address
          destination: w.destination,
          type: 'withdrawal' as const
        }
      })
      
      // Combine and sort by timestamp (newest first)
      const combinedHistory = [...donationHistoryData, ...withdrawalHistoryData]
      combinedHistory.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      setDonationHistory(combinedHistory)
      
      console.log('✅ Processed transaction history:', donationHistoryData.length, 'donations +', withdrawalHistoryData.length, 'withdrawals')
    } catch (error) {
      console.error('❌ Error processing transaction history:', error)
      setDonationHistory([])
    }
  }
  
  // Legacy function for compatibility
  const loadPersonalDonationHistory = () => {
    if (campaign) {
      loadDonationHistoryFromCampaignData(campaign)
    }
  }

  // Centralized, throttled campaign fetcher to avoid duplicate GETs
  const fetchCampaignData = async (force = false) => {
    try {
      if (!campaignId) return
      const now = Date.now()
      // Reduced throttling for better real-time donation updates
      if (!force) {
        if (isFetchingCampaignRef.current) return
        if (now - lastFetchAtRef.current < 1500) return // Reduced from 3s to 1.5s
        if (!isPageVisibleRef.current) return
      }

      isFetchingCampaignRef.current = true
      lastFetchAtRef.current = now
      
      const response = await fetch(`/api/campaigns/${campaignId}`)
      const result = await response.json()
      
      if (result.success && result.campaign) {
        const campaignData = result.campaign
        
        // Update campaign state with latest data
        setCampaign(campaignData)
        
        // Update totals if changed to avoid flicker
        const nextTotal = campaignData.stats?.confirmedAmount || 0
        setRealTimeDonationTotal(prev => (Math.abs(nextTotal - prev) > 1e-9 ? nextTotal : prev))
        
        // Enhanced donation change detection for immediate transparency updates
        const nextCount = (campaignData.donations || []).length
        const prevCount = prevDonationsCountRef.current
        const prevTotal = prevConfirmedAmountRef.current
        const totalChanged = Math.abs(nextTotal - prevTotal) > 1e-10 // More sensitive
        const countChanged = nextCount !== prevCount
        
        if (totalChanged || countChanged) {
          console.log('🎯 Donation change detected:', {
            countChange: `${prevCount} → ${nextCount}`,
            totalChange: `${prevTotal.toFixed(6)} → ${nextTotal.toFixed(6)} SONIC`,
            triggering: 'transparency refresh'
          })
          setCampaignDonationsRefresh(prev => prev + 1)
          
          // Also trigger immediate re-render of personal history
          setTimeout(() => loadDonationHistoryFromCampaignData(campaignData), 100)
        }
        
        // Update previous trackers
        prevDonationsCountRef.current = nextCount
        prevConfirmedAmountRef.current = nextTotal

        // Update donation history
        loadDonationHistoryFromCampaignData(campaignData)
        
        // Handle update indicator when timestamp changed
        if (lastUpdatedTimestamp && campaignData.lastUpdated !== lastUpdatedTimestamp) {
          setCampaignRefreshKey(prev => prev + 1)
          const updateIndicator = document.createElement('div')
          updateIndicator.className = 'fixed top-20 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse'
          updateIndicator.innerHTML = '📢 Campaign Updated!'
          document.body.appendChild(updateIndicator)
          setTimeout(() => {
            if (document.body.contains(updateIndicator)) document.body.removeChild(updateIndicator)
          }, 3000)
        }
        setLastUpdatedTimestamp(campaignData.lastUpdated || '')
      }
    } catch (error) {
      console.error('❌ Error fetching campaign data:', error)
    } finally {
      isFetchingCampaignRef.current = false
    }
  }

  const updateRealTimeDonationTotal = async () => {
    try {
      console.log('🔄 Refreshing comprehensive campaign data for:', campaignId)
      
      if (!campaignId) {
        console.log('⚠️ No campaign ID available')
        return
      }
      // Force bypass throttle for explicit user-triggered refresh
      await fetchCampaignData(true)
    } catch (error) {
      console.error('❌ Error refreshing campaign data:', error)
    }
  }

  // ALL HOOKS MUST BE BEFORE EARLY RETURNS
  // Cleanup polling on component unmount
  useEffect(() => {
    return () => {
      if (txStatusPollingRef.current) {
        clearInterval(txStatusPollingRef.current)
        txStatusPollingRef.current = null
      }
      if (campaignPollingRef.current) {
        clearInterval(campaignPollingRef.current)
        campaignPollingRef.current = null
      }
    }
  }, [])

  // Load personal donation history on component mount
  useEffect(() => {
    loadPersonalDonationHistory()
  }, [])

  // Auto-refresh personal donations when wallet connected
  useEffect(() => {
    if (walletConnected && userAddress) {
      const interval = setInterval(() => {
        loadPersonalDonationHistory()
      }, 10000) // Refresh every 10 seconds
      
      return () => clearInterval(interval)
    }
  }, [walletConnected, userAddress])

  // Update real-time donation total when campaign loads or donations refresh
  useEffect(() => {
    if (campaignId && campaign) {
      console.log('🚀 Campaign loaded, updating donation total for campaign:', campaignId)
      // Load actual donations (avoid resetting to 0 which causes flicker)
      updateRealTimeDonationTotal()
    }
  }, [campaignId, campaignDonationsRefresh, campaign])

  // Aggressive polling for real-time donation updates
  useEffect(() => {
    if (campaignId) {
      const interval = setInterval(() => {
        fetchCampaignData(false)
      }, 3000) // Poll every 3s for faster donation detection
      
      campaignPollingRef.current = interval
      
      return () => {
        if (campaignPollingRef.current) {
          clearInterval(campaignPollingRef.current)
          campaignPollingRef.current = null
        }
      }
    }
  }, [campaignId])

  // Aggressive refresh on visibility changes for real-time donation updates
  useEffect(() => {
    const onVisibility = () => {
      const visible = !document.hidden
      isPageVisibleRef.current = visible
      if (visible) {
        console.log('📱 Tab became visible - forcing donation data refresh')
        fetchCampaignData(true)
        // Also trigger donation transparency refresh
        setCampaignDonationsRefresh(prev => prev + 1)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Early returns AFTER all hooks
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading campaign...</div>
  if (!campaign) return <div className="min-h-screen flex items-center justify-center">Campaign not found</div>

  // Calculate real-time progress using only blockchain donations (avoid double-counting)
  // realTimeDonationTotal is the accurate source from blockchain transactions
  const totalRaised = realTimeDonationTotal
  const progressPercentage = (totalRaised / (campaign.targetAmount || 1)) * 100

  const detectNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const sonic = await ensureSonicNetwork()
        setCurrentNetwork(sonic || SUPPORTED_NETWORKS[64165])
      } catch (error) {
        console.error('Error ensuring Sonic network:', error)
        setCurrentNetwork(SUPPORTED_NETWORKS[64165])
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        // Ensure Sonic before or after requesting accounts
        await ensureSonicNetwork()
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        setUserAddress(accounts[0])
        setWalletConnected(true)
        await detectNetwork()
        await fetchBalance(accounts[0])
        loadPersonalDonationHistory()
      } catch (err) { console.error(err) }
    } else { alert("MetaMask not detected. Please install MetaMask to donate.") }
  }

  const fetchBalance = async (address: string) => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const balanceBigInt = await provider.getBalance(address)
        setBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4))
      }
    } catch (err) { console.error(err) }
  }

  const handleDonate = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet first to make a donation")
      return
    }
    
    if (step === 1) {
      if (!donationData.amount || Number(donationData.amount) <= 0) {
        alert("Please enter a valid donation amount")
        return
      }
      setStep(2)
      return
    }

    setIsLoading(true)
    try {
      if (!window.ethereum) {
        throw new Error('MetaMask not found')
      }
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const tx = await signer.sendTransaction({ 
        to: ethers.getAddress(campaign.walletAddress), 
        value: ethers.parseEther(donationData.amount || "0") 
      })
      setTxHash(tx.hash)
      
      // Create donation record for campaign transparency
      const donationRecord = {
        id: `${Date.now()}_${tx.hash}`,
        txHash: tx.hash,
        amount: donationData.amount,
        currency: currentNetwork?.currency || "SONIC",
        status: "pending",
        explorerUrl: `${currentNetwork?.explorer || 'https://blaze.soniclabs.com'}/tx/${tx.hash}`,
        donorAddress: userAddress,
        message: donationData.message,
        anonymous: donationData.anonymous,
        networkName: currentNetwork?.name || 'Sonic Blaze Testnet'
      }
      
      // Save to comprehensive campaign data via API
      console.log('💾 Saving donation to comprehensive campaign', campaignId)
      const saveResponse = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'add_donation',
          donation: donationRecord
        })
      })
      
      const saveResult = await saveResponse.json()
      if (saveResult.success) {
        console.log('✅ Donation saved to comprehensive campaign data')
        // Update local state with new campaign data
        setCampaign(saveResult.campaign)
        setRealTimeDonationTotal(saveResult.campaign.stats.confirmedAmount || 0)
      } else {
        console.error('❌ Failed to save donation:', saveResult.error)
      }
      
      // Trigger campaign donations refresh immediately
      setCampaignDonationsRefresh(prev => prev + 1)
      
      // Force update real-time total immediately
      setTimeout(async () => {
        await updateRealTimeDonationTotal()
      }, 1000) // Small delay to ensure storage is updated
      
      // Refresh personal history to show new donation
      setTimeout(() => {
        loadPersonalDonationHistory()
      }, 1000)
      
      setStep(3)
      
      // Start real-time status polling
      startTransactionPolling(tx.hash, campaignId as string)
      
      setShowPopup(true)
    } catch (e: any) { 
      console.error(e)
      alert(e.message || "Transaction failed. Please try again.") 
    } finally { 
      setIsLoading(false) 
    }
  }

  const handleDonateAgain = () => {
    setShowPopup(false)
    setStep(1)
    setDonationData({ amount: "", message: "", anonymous: false })
    setTxHash("")
  }

  // Real-time transaction status polling
  const startTransactionPolling = (txHash: string, campaignId: string) => {
    // Clear existing polling
    if (txStatusPollingRef.current) {
      clearInterval(txStatusPollingRef.current)
    }
    
    const pollInterval = setInterval(async () => {
      try {
        if (!window.ethereum) return
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        const receipt = await provider.getTransactionReceipt(txHash)
        
        if (receipt) {
          // Transaction confirmed - update both storages
          const confirmationData = {
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
            confirmationTime: new Date()
          }
          
          // Update donation status in comprehensive campaign data
          console.log('🔄 Updating donation status in comprehensive data')
          const updateResponse = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'update_donation_status',
              txHash: txHash,
              status: receipt.status === 1 ? 'confirmed' : 'failed',
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            })
          })
          
          const updateResult = await updateResponse.json()
          if (updateResult.success) {
            console.log('✅ Donation status updated in comprehensive data')
            // Update local state with new campaign data
            setCampaign(updateResult.campaign)
            setRealTimeDonationTotal(updateResult.campaign.stats.confirmedAmount || 0)
            loadDonationHistoryFromCampaignData(updateResult.campaign)
          } else {
            console.error('❌ Failed to update donation status:', updateResult.error)
          }
          
          // Trigger campaign donations refresh
          setCampaignDonationsRefresh(prev => prev + 1)
          
          // Update real-time donation total immediately
          await updateRealTimeDonationTotal()
          
          // Refresh personal history to show updated status
          setTimeout(() => {
            loadPersonalDonationHistory()
          }, 1000)
          
          // Clear polling
          if (txStatusPollingRef.current) {
            clearInterval(txStatusPollingRef.current)
            txStatusPollingRef.current = null
          }
          
          console.log(`Transaction ${txHash} confirmed in block ${receipt.blockNumber}`)
        }
      } catch (error) {
        console.error('Error polling transaction status:', error)
      }
    }, 3000) // Poll every 3 seconds
    
    txStatusPollingRef.current = pollInterval
    
    // Clear polling after 10 minutes to prevent infinite polling
    setTimeout(() => {
      if (txStatusPollingRef.current) {
        clearInterval(txStatusPollingRef.current)
        txStatusPollingRef.current = null
      }
    }, 600000)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <div className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
          {walletConnected ? (
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-gray-500">{currentNetwork?.name || 'Sonic Network'}</div>
                <div className="text-sm font-semibold">{balance} {currentNetwork?.currency || 'SONIC'}</div>
              </div>
              <Badge variant="secondary" className="font-mono">
                {userAddress.slice(0,6)}...{userAddress.slice(-4)}
              </Badge>
            </div>
          ) : (
            <Button onClick={connectWallet} size="sm">
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative h-96 w-full bg-gray-900">
        <SafeImage
          campaign={campaign}
          alt={campaign.title || campaign.name || "Campaign"}
          className="absolute w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              {(campaign.urgencyLevel === 'urgent' || campaign.urgent) && (
                <Badge variant="destructive" className="mb-3 animate-pulse">
                  🚨 URGENT RELIEF NEEDED
                </Badge>
              )}
              <h1 className="text-4xl font-bold text-white mb-3">{campaign.title || campaign.name}</h1>
              <p className="text-lg text-gray-200 mb-4">{campaign.longDescription || campaign.description}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {campaign.location || "Philippines"}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {campaign.donorCount || 0} donors
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Progress - Real-Time */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center pb-3">
                <CardTitle>Campaign Progress</CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    console.log('🔄 Manual refresh triggered - updating all donation components')
                    updateRealTimeDonationTotal()
                    setCampaignDonationsRefresh(prev => prev + 1)
                    setCampaignRefreshKey(prev => prev + 1)
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="flex flex-col">
                      <span className="text-3xl font-bold text-green-600">
                        {totalRaised.toFixed(4)} SONIC
                      </span>
                      <span className="text-xs text-blue-600 mt-1">
                        Real-time blockchain donations
                      </span>
                    </div>
                    <span className="text-gray-600">
                      of {(campaign.targetAmount || 0).toLocaleString()} SONIC goal
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{Math.round(progressPercentage)}% funded</span>
                    <span>{((campaign.targetAmount || 0) - totalRaised).toFixed(4)} SONIC remaining</span>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Impact Section */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {campaign.beneficiaries > 0 && (
                    <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{campaign.beneficiaries.toLocaleString()} people to help</span>
                    </div>
                  )}
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Organized by {campaign.ngoName}</span>
                  </div>
                  {campaign.tags && campaign.tags.length > 0 && campaign.tags.map((tag: string, idx: number) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm capitalize">{tag} initiative</span>
                    </div>
                  ))}
                  {(!campaign.tags || campaign.tags.length === 0) && campaign.beneficiaries === 0 && (
                    <div className="col-span-2 text-center text-gray-500 py-4">
                      <span className="text-sm">Campaign details will be updated by the NGO</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaign.updates && campaign.updates.length > 0 ? (
                    campaign.updates.slice(0, 3).map((update: any, idx: number) => (
                      <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {new Date(update.date || update.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm font-medium mb-1">{update.title}</div>
                        <div className="text-sm text-gray-600">{update.content}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 py-4">
                      <span className="text-sm">No updates yet. The NGO will post progress updates here.</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Reports & Documents */}
            <CampaignReports 
              campaignId={campaignId as string} 
              refreshKey={campaignRefreshKey}
            />

            {/* Campaign Donations Transparency - Always Visible */}
            <CampaignDonations 
              campaignId={campaignId as string} 
              refreshKey={campaignDonationsRefresh}
              onTotalUpdate={(total) => {
                setRealTimeDonationTotal(total)
              }}
            />

            {/* Campaign Transaction History - Donations & Withdrawals */}
            <Card>
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Campaign Financial History ({donationHistory.length})
                </CardTitle>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => {
                    console.log('🔄 Manual refresh of personal transactions - syncing with global data')
                    updateRealTimeDonationTotal() // Force fresh campaign data
                    setCampaignDonationsRefresh(prev => prev + 1) // Trigger transparency refresh
                    loadPersonalDonationHistory() // Refresh personal view
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent>
                {donationHistory.length === 0 ? (
                  <div className="text-center py-6 text-gray-500">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-medium">No financial activity yet</p>
                    <p className="text-xs mt-1">Donations and NGO withdrawals will appear here for full transparency</p>
                  </div>
                ) : (
                  <>

                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Complete financial transparency • Donations & NGO withdrawals
                      </div>
                      <div className="text-xs text-gray-400">
                        Last updated: {new Date().toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="border-b bg-gray-50">
                          <tr>
                            <th className="text-left p-3 font-semibold">Type</th>
                            <th className="text-left p-3 font-semibold">Amount</th>
                            <th className="text-left p-3 font-semibold">Wallet/Destination</th>
                            <th className="text-left p-3 font-semibold">Status</th>
                            <th className="text-left p-3 font-semibold">Date & Time</th>
                            <th className="text-left p-3 font-semibold">Transaction</th>
                          </tr>
                        </thead>
                        <tbody>
                          {donationHistory.map(d => (
                            <tr key={d.id} className={`border-b hover:bg-gray-50 transition-colors ${d.type === 'withdrawal' ? 'bg-orange-50' : ''}`}>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  {d.type === 'withdrawal' ? (
                                    <>
                                      <div className="w-4 h-4 text-orange-600">💸</div>
                                      <Badge variant="outline" className="text-orange-700 border-orange-300">
                                        NGO Withdrawal
                                      </Badge>
                                    </>
                                  ) : (
                                    <>
                                      <Heart className="w-4 h-4 text-green-600" />
                                      <Badge variant="outline" className="text-green-700 border-green-300">
                                        Donation
                                      </Badge>
                                    </>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="flex items-center space-x-2">
                                  <DollarSign className={`w-4 h-4 ${d.type === 'withdrawal' ? 'text-orange-600' : 'text-green-600'}`} />
                                  <span className="font-bold">{d.amount} {d.currency}</span>
                                </div>
                              </td>
                              <td className="p-3">
                                <div className="font-mono text-xs text-gray-600">
                                  {d.type === 'withdrawal' && d.destination ? (
                                    <>
                                      <div className="text-xs text-gray-500 mb-1">To:</div>
                                      <div>{d.destination.slice(0, 6)}...{d.destination.slice(-4)}</div>
                                      <Badge variant="secondary" className="text-xs mt-1">NGO Fund</Badge>
                                    </>
                                  ) : d.walletAddress ? (
                                    <>
                                      <div className="text-xs text-gray-500 mb-1">From:</div>
                                      <div>{d.walletAddress.slice(0, 6)}...{d.walletAddress.slice(-4)}</div>
                                      {walletConnected && userAddress.toLowerCase() === d.walletAddress.toLowerCase() && (
                                        <Badge variant="secondary" className="text-xs mt-1">Your Wallet</Badge>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-gray-400">Unknown</span>
                                  )}
                                </div>
                              </td>
                              <td className="p-3">
                                  <div className="space-y-1">
                                    <Badge 
                                      variant={d.status === 'confirmed' ? 'default' : d.status === 'pending' ? 'secondary' : 'destructive'}
                                      className="text-xs flex items-center gap-1"
                                    >
                                      {d.status === 'confirmed' && <CheckCircle className="w-3 h-3" />}
                                      {d.status === 'pending' && <Clock className="w-3 h-3 animate-pulse" />}
                                      {d.status === 'confirmed' ? 'Confirmed' : d.status === 'pending' ? 'Processing...' : 'Failed'}
                                    </Badge>
                                    {d.status === 'pending' && (
                                      <div className="text-xs text-orange-600 animate-pulse">
                                        Awaiting confirmation...
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="text-xs">
                                    <div className="font-medium">{d.timestamp.toLocaleDateString()}</div>
                                    <div className="text-gray-500">{d.timestamp.toLocaleTimeString()}</div>
                                    {d.blockNumber && (
                                      <div className="text-gray-400 mt-1">Block: {d.blockNumber}</div>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="space-y-1">
                                    <div className="font-mono text-xs break-all text-gray-600">
                                      {d.txHash.slice(0, 10)}...{d.txHash.slice(-8)}
                                    </div>
                                    <a 
                                      href={d.explorerUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    >
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      View
                                    </a>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Form */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <>
                    <div>
                      <Label className="text-base mb-2 block">
                        Donation Amount ({currentNetwork?.currency || 'SONIC'})
                      </Label>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        value={donationData.amount} 
                        onChange={e => setDonationData({...donationData, amount: e.target.value})}
                        className="text-lg h-12"
                      />
                      <div className="flex gap-2 mt-2">
                        {['0.01', '0.05', '0.1'].map(amt => (
                          <Button 
                            key={amt}
                            variant="outline" 
                            size="sm"
                            onClick={() => setDonationData({...donationData, amount: amt})}
                          >
                            {amt} {currentNetwork?.currency || 'SONIC'}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Message (optional)</Label>
                      <Textarea 
                        placeholder="Share words of encouragement..." 
                        value={donationData.message} 
                        onChange={e => setDonationData({...donationData, message: e.target.value})}
                        rows={3}
                      />
                    </div>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={donationData.anonymous} 
                        onChange={e => setDonationData({...donationData, anonymous: e.target.checked})}
                        className="rounded"
                      />
                      <span className="text-sm">Make this donation anonymous</span>
                    </label>
                    
                    <Button 
                      onClick={handleDonate} 
                      disabled={!donationData.amount || Number(donationData.amount) <= 0 || !walletConnected}
                      className="w-full h-12 text-base"
                    >
                      {walletConnected ? 'Continue to Review' : 'Connect Wallet to Donate'}
                    </Button>
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <div className="bg-blue-50 p-4 rounded-lg space-y-2">
                      <h3 className="font-semibold mb-3">Review Your Donation</h3>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Amount:</span>
                        <span className="font-semibold">{donationData.amount} {currentNetwork?.currency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">To:</span>
                        <span className="font-semibold">{campaign.ngoName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Network:</span>
                        <span className="font-semibold">{currentNetwork?.name}</span>
                      </div>
                      {donationData.message && (
                        <div className="pt-2 border-t">
                          <div className="text-xs text-gray-600 mb-1">Message:</div>
                          <div className="text-sm italic">{donationData.message}</div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={handleBack}
                        className="flex-1"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button 
                        onClick={handleDonate} 
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Processing...' : 'Confirm & Send'}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Organization Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">About {campaign.ngoName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Campaign Status</span>
                  <Badge variant="default" className="bg-green-600">
                    {campaign.status || 'Active'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-gray-600 mb-2">Category</div>
                  <div className="space-y-1 text-xs">
                    <div>{campaign.category || 'Emergency Relief'}</div>
                    <div>Wallet: {campaign.walletAddress?.slice(0, 10)}...{campaign.walletAddress?.slice(-8)}</div>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-gray-500">Managed by {campaign.ngoName}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showPopup} onOpenChange={setShowPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2 text-green-600 text-xl">
              <CheckCircle className="w-6 h-6" />
              <span>Donation Successful!</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-base mb-3">
                Thank you for your generous donation!
              </p>
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200 mb-3">
                <div className="text-2xl font-bold text-green-700">
                  {donationData.amount} {currentNetwork?.currency || 'SONIC'}
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Your contribution will make a real difference in the lives of typhoon victims.
              </p>
            </div>
            {txHash && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <div className="text-xs font-semibold text-gray-600 mb-2">Transaction Hash:</div>
                <a 
                  href={`${currentNetwork?.explorer}/tx/${txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-blue-600 hover:underline break-all flex items-center gap-1"
                >
                  <span>{txHash.slice(0, 20)}...{txHash.slice(-20)}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                </a>
              </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-col gap-2">
            <Button onClick={handleDonateAgain} className="w-full">
              <Heart className="w-4 h-4 mr-2" />
              Make Another Donation
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                setShowPopup(false)
                window.history.back()
              }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}