"use client"

import { useState, useEffect } from "react"
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
}

interface NetworkInfo {
  chainId: number
  name: string
  currency: string
  explorer: string
  rpcUrl: string
}

const SUPPORTED_NETWORKS: { [key: number]: NetworkInfo } = {
  1: { chainId: 1, name: 'Ethereum Mainnet', currency: 'ETH', explorer: 'https://etherscan.io', rpcUrl: 'https://mainnet.infura.io/v3/' },
  11155111: { chainId: 11155111, name: 'Sepolia Testnet', currency: 'SepoliaETH', explorer: 'https://sepolia.etherscan.io', rpcUrl: 'https://sepolia.infura.io/v3/' },
  137: { chainId: 137, name: 'Polygon Mainnet', currency: 'MATIC', explorer: 'https://polygonscan.com', rpcUrl: 'https://polygon-rpc.com/' },
  80001: { chainId: 80001, name: 'Mumbai Testnet', currency: 'MATIC', explorer: 'https://mumbai.polygonscan.com', rpcUrl: 'https://rpc-mumbai.maticvigil.com/' },
  56: { chainId: 56, name: 'BSC Mainnet', currency: 'BNB', explorer: 'https://bscscan.com', rpcUrl: 'https://bsc-dataseed1.binance.org/' },
  97: { chainId: 97, name: 'BSC Testnet', currency: 'tBNB', explorer: 'https://testnet.bscscan.com', rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/' },
  64165: { chainId: 64165, name: 'Sonic Blaze Testnet', currency: 'S', explorer: 'https://blaze.soniclabs.com', rpcUrl: 'https://rpc.blaze.soniclabs.com' }
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

  const ngo = {
    id: "1",
    title: "Emergency Relief for Earthquake Victims",
    description: "Providing immediate shelter, clean water, food supplies, and medical aid to families affected by the earthquake in Cebu region.",
    ngoName: "Web3 Cebu",
    location: "Cebu, Philippines",
    category: "Emergency Relief",
    targetAmount: 50000,
    raisedAmount: 37250,
    donorCount: 412,
    daysLeft: 8,
    image: "/earthquake.png",
    urgent: true,
    score: 94,
    email: "relief@pdrf.org.ph",
    phone: "+63 2 8123 4567",
    established: "2010",
    social: {
      facebook: "https://facebook.com/web3cebu",
      twitter: "https://twitter.com/web3cebu"
    },
    walletAddress: "0x9207C7C3aFDDC7FfD432316972eb6a5cE5aBe45A",
    //mock
    impact: [
      "5,000+ families provided shelter",
      "10,000+ relief packs distributed",
      "3 medical outposts established",
      "20+ tons of clean water delivered"
    ],
    updates: [
      { date: "2 days ago", text: "Successfully delivered 500 relief packs to Bantayan Island" },
      { date: "5 days ago", text: "Medical team deployed to affected areas in Bohol" },
      { date: "1 week ago", text: "Emergency shelter construction started in Cebu" }
    ],
    reports: [
      { name: "Impact Assessment Report Q4 2024.pdf", size: "2.4 MB" },
      { name: "Financial Transparency Report 2024.pdf", size: "1.8 MB" },
      { name: "Relief Distribution Plan.pdf", size: "956 KB" }
    ]
  }

  const progressPercentage = (ngo.raisedAmount / ngo.targetAmount) * 100

  const detectNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const network = await provider.getNetwork()
        const networkInfo = SUPPORTED_NETWORKS[Number(network.chainId)]
        if (networkInfo) setCurrentNetwork(networkInfo)
      } catch (error) { console.error(error) }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        setUserAddress(accounts[0])
        setWalletConnected(true)
        await detectNetwork()
        await fetchBalance(accounts[0])
        loadDonationHistory(accounts[0])
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

  const saveDonationHistory = (address: string, history: DonationHistory[]) => {
    try {
      localStorage.setItem(`donation_history_${address.toLowerCase()}`, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving donation history:', error)
    }
  }

  const loadDonationHistory = (address: string) => {
    try {
      const saved = localStorage.getItem(`donation_history_${address.toLowerCase()}`)
      if (saved) {
        const parsed = JSON.parse(saved)
        const historyData: DonationHistory[] = parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }))
        setDonationHistory(historyData)
      }
    } catch (error) {
      console.error('Error loading donation history:', error)
    }
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
        to: ethers.getAddress(ngo.walletAddress), 
        value: ethers.parseEther(donationData.amount || "0") 
      })
      setTxHash(tx.hash)
      
      const newDonation: DonationHistory = { 
        id: Date.now().toString(), 
        txHash: tx.hash, 
        amount: donationData.amount, 
        currency: currentNetwork?.currency || "ETH", 
        timestamp: new Date(), 
        status: "pending", 
        explorerUrl: `${currentNetwork?.explorer}/tx/${tx.hash}` 
      }
      
      const updatedHistory = [newDonation, ...donationHistory]
      setDonationHistory(updatedHistory)
      saveDonationHistory(userAddress, updatedHistory)
      
      setStep(3)
      
      // Wait for transaction confirmation and update status
      const receipt = await tx.wait()
      const updatedHistoryWithConfirmation = donationHistory.map(d => 
        d.txHash === tx.hash && receipt
          ? { ...d, status: 'confirmed' as const, blockNumber: receipt.blockNumber, gasUsed: receipt.gasUsed.toString() }
          : d
      )
      setDonationHistory(updatedHistoryWithConfirmation)
      saveDonationHistory(userAddress, updatedHistoryWithConfirmation)
      
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
                <div className="text-xs text-gray-500">{currentNetwork?.name || 'Connected'}</div>
                <div className="text-sm font-semibold">{balance} {currentNetwork?.currency}</div>
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
        <img 
          src={ngo.image} 
          alt={ngo.title} 
          className="absolute w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container mx-auto">
            <div className="max-w-3xl">
              {ngo.urgent && (
                <Badge variant="destructive" className="mb-3 animate-pulse">
                  🚨 URGENT RELIEF NEEDED
                </Badge>
              )}
              <h1 className="text-4xl font-bold text-white mb-3">{ngo.title}</h1>
              <p className="text-lg text-gray-200 mb-4">{ngo.description}</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-300">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {ngo.location}
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {ngo.donorCount} donors
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {ngo.daysLeft} days left
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
            {/* Campaign Progress */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-4">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-3xl font-bold text-green-600">
                      ${ngo.raisedAmount.toLocaleString()}
                    </span>
                    <span className="text-gray-600">
                      of ${ngo.targetAmount.toLocaleString()} goal
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between mt-2 text-sm text-gray-500">
                    <span>{Math.round(progressPercentage)}% funded</span>
                    <span>${(ngo.targetAmount - ngo.raisedAmount).toLocaleString()} remaining</span>
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
                  {ngo.impact.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
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
                  {ngo.updates.map((update, idx) => (
                    <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="text-xs text-gray-500 mb-1">{update.date}</div>
                      <div className="text-sm">{update.text}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Documents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Reports & Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {ngo.reports.map((report, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="text-sm font-medium">{report.name}</div>
                        <div className="text-xs text-gray-500">{report.size}</div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Real-Time Donation History */}
            {walletConnected && (
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="flex items-center">
                    <History className="w-5 h-5 mr-2" />
                    Your Donation History
                  </CardTitle>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => loadDonationHistory(userAddress)}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {donationHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Heart className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">No donations yet</p>
                      <p className="text-xs mt-1">Your donation history will appear here</p>
                      <p className="text-xs text-gray-400 mt-2">Stored locally for transparency</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500 mb-2 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified on-chain • Stored locally
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="border-b bg-gray-50">
                            <tr>
                              <th className="text-left p-3 font-semibold">Amount</th>
                              <th className="text-left p-3 font-semibold">Status</th>
                              <th className="text-left p-3 font-semibold">Date & Time</th>
                              <th className="text-left p-3 font-semibold">Transaction</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donationHistory.map(d => (
                              <tr key={d.id} className="border-b hover:bg-gray-50 transition-colors">
                                <td className="p-3">
                                  <div className="flex items-center space-x-2">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                    <span className="font-bold">{d.amount} {d.currency}</span>
                                  </div>
                                </td>
                                <td className="p-3">
                                  <Badge 
                                    variant={d.status === 'confirmed' ? 'default' : d.status === 'pending' ? 'secondary' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {d.status === 'confirmed' ? '✓ Confirmed' : d.status === 'pending' ? '⏳ Pending' : '✗ Failed'}
                                  </Badge>
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
                  )}
                </CardContent>
              </Card>
            )}
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
                        Donation Amount ({currentNetwork?.currency || 'ETH'})
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
                            {amt} {currentNetwork?.currency || 'ETH'}
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
                        <span className="font-semibold">{ngo.ngoName}</span>
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
                <CardTitle className="text-base">About {ngo.ngoName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trust Score</span>
                  <Badge variant="default" className="bg-green-600">
                    {ngo.score}/100
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Established</span>
                  <span className="font-medium">{ngo.established}</span>
                </div>
                <div className="pt-3 border-t">
                  <div className="text-gray-600 mb-2">Contact</div>
                  <div className="space-y-1 text-xs">
                    <div>{ngo.email}</div>
                    <div>{ngo.phone}</div>
                  </div>
                </div>
                <div className="flex space-x-3 pt-2">
                  <a href={ngo.social.facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="w-5 h-5 text-blue-600 hover:text-blue-700 cursor-pointer" />
                  </a>
                  <a href={ngo.social.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="w-5 h-5 text-blue-400 hover:text-blue-500 cursor-pointer" />
                  </a>
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
                  {donationData.amount} {currentNetwork?.currency}
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