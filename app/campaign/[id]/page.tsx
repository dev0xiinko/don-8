"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Heart,
  Shield,
  Users,
  MapPin,
  Star,
  Wallet,
  Eye,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Clock,
  DollarSign,
  History,
  RefreshCw,
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
  1: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    rpcUrl: 'https://mainnet.infura.io/v3/'
  },
  11155111: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    currency: 'SepoliaETH',
    explorer: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://sepolia.infura.io/v3/'
  },
  137: {
    chainId: 137,
    name: 'Polygon Mainnet',
    currency: 'MATIC',
    explorer: 'https://polygonscan.com',
    rpcUrl: 'https://polygon-rpc.com/'
  },
  80001: {
    chainId: 80001,
    name: 'Mumbai Testnet',
    currency: 'MATIC',
    explorer: 'https://mumbai.polygonscan.com',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com/'
  },
  56: {
    chainId: 56,
    name: 'BSC Mainnet',
    currency: 'BNB',
    explorer: 'https://bscscan.com',
    rpcUrl: 'https://bsc-dataseed1.binance.org/'
  },
  97: {
    chainId: 97,
    name: 'BSC Testnet',
    currency: 'tBNB',
    explorer: 'https://testnet.bscscan.com',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/'
  },
  64165: {
    chainId: 64165,
    name: 'Sonic Blaze Testnet',
    currency: 'S',
    explorer: 'https://blaze.soniclabs.com',
    rpcUrl: 'https://rpc.blaze.soniclabs.com'
  }
}

export default function DonatePage() {
  const params = useParams()
  const ngoId = params.id

  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [balance, setBalance] = useState<string>("0.0")
  const [currentNetwork, setCurrentNetwork] = useState<NetworkInfo | null>(null)
  const [txHash, setTxHash] = useState<string>("")
  const [donationHistory, setDonationHistory] = useState<DonationHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [donationData, setDonationData] = useState({
    amount: "",
    currency: "S", // Default to Sonic currency
    message: "",
    anonymous: false,
    recurring: false,
  })
  const [step, setStep] = useState(1)
  const [ngo, setNgo] = useState<any>(null)

  useEffect(() => {
    setNgo({
      id: ngoId,
      name: "Education for All Foundation",
      description: "Providing quality education to underprivileged children worldwide.",
      category: "Education",
      location: "Philippines",
      score: 95,
      totalRaised: 125000,
      goal: 200000,
      donors: 1250,
      image: "/placeholder.svg?height=120&width=120",
      verified: true,
      lastUpdate: "2 days ago",
      walletAddress: "0x9207C7C3aFDDC7FfD432316972eb6a5cE5aBe45A",
    })
  }, [ngoId])

  // Detect network and update currency
  const detectNetwork = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
        
        const networkInfo = SUPPORTED_NETWORKS[chainId]
        if (networkInfo) {
          setCurrentNetwork(networkInfo)
          setDonationData(prev => ({ ...prev, currency: networkInfo.currency }))
        } else {
          console.warn(`Unsupported network: ${chainId}`)
          // Default to Sonic Blaze if network is unknown
          setCurrentNetwork({
            chainId,
            name: `Unknown Network (${chainId})`,
            currency: 'S',
            explorer: 'https://blaze.soniclabs.com',
            rpcUrl: ''
          })
        }
      } catch (error) {
        console.error("Failed to detect network:", error)
      }
    }
  }

  // Check if wallet is already connected
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({
            method: "eth_accounts",
          })
          if (accounts.length > 0) {
            setUserAddress(accounts[0])
            setWalletConnected(true)
            await detectNetwork()
            await fetchBalance(accounts[0])
            loadDonationHistory(accounts[0])
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err)
        }
      }
    }
    checkConnection()

    // Listen for network changes
    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])

  // Connect wallet manually
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        setUserAddress(accounts[0])
        setWalletConnected(true)
        await detectNetwork()
        await fetchBalance(accounts[0])
        loadDonationHistory(accounts[0])
      } catch (err) {
        console.error("Wallet connection rejected", err)
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.")
    }
  }

  // Fetch balance
  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const balanceBigInt = await provider.getBalance(address)
      const balanceInEth = ethers.formatEther(balanceBigInt)
      setBalance(parseFloat(balanceInEth).toFixed(4))
    } catch (err) {
      console.error("Failed to fetch balance:", err)
    }
  }

  // Load donation history from localStorage
  const loadDonationHistory = (address: string) => {
    const historyKey = `donation_history_${address.toLowerCase()}`
    const savedHistory = localStorage.getItem(historyKey)
    if (savedHistory) {
      const history = JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      setDonationHistory(history)
      
      // Update pending transactions
      history.forEach((donation: DonationHistory) => {
        if (donation.status === 'pending') {
          checkTransactionStatus(donation.txHash, address)
        }
      })
    }
  }

  // Save donation history to localStorage
  const saveDonationHistory = (address: string, history: DonationHistory[]) => {
    const historyKey = `donation_history_${address.toLowerCase()}`
    localStorage.setItem(historyKey, JSON.stringify(history))
  }

  // Check transaction status
  const checkTransactionStatus = async (txHash: string, userAddress: string) => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const receipt = await provider.getTransactionReceipt(txHash)
      
      if (receipt) {
        setDonationHistory(prev => {
          const updated = prev.map(donation => 
            donation.txHash === txHash 
              ? { 
                  ...donation, 
                  status: (receipt.status === 1 ? 'confirmed' : 'failed') as 'confirmed' | 'failed',
                  blockNumber: receipt.blockNumber,
                  gasUsed: receipt.gasUsed.toString()
                }
              : donation
          )
          saveDonationHistory(userAddress, updated)
          return updated
        })
      }
    } catch (error) {
      console.error("Failed to check transaction status:", error)
    }
  }

  // Refresh donation history
  const refreshHistory = () => {
    if (userAddress) {
      loadDonationHistory(userAddress)
      donationHistory
        .filter(d => d.status === 'pending')
        .forEach(d => checkTransactionStatus(d.txHash, userAddress))
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setDonationData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle donation transaction
  const handleDonate = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet first.")
      return
    }

    if (step < 2) {
      setStep(step + 1)
      return
    }

    setIsLoading(true)
    
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      // Normalize NGO address
      const recipient = ethers.getAddress(ngo.walletAddress)

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(donationData.amount || "0"),
      })

      console.log("Transaction:", tx)
      setTxHash(tx.hash)

      // Add to donation history
      const newDonation: DonationHistory = {
        id: Date.now().toString(),
        txHash: tx.hash,
        amount: donationData.amount,
        currency: currentNetwork?.currency || 'S',
        timestamp: new Date(),
        status: 'pending',
        explorerUrl: `${currentNetwork?.explorer || 'https://blaze.soniclabs.com'}/tx/${tx.hash}`
      }

      const updatedHistory = [newDonation, ...donationHistory]
      setDonationHistory(updatedHistory)
      saveDonationHistory(userAddress, updatedHistory)

      setStep(3)

      // Wait for transaction confirmation
      const receipt = await tx.wait()
      if (receipt) {
        checkTransactionStatus(tx.hash, userAddress)
        await fetchBalance(userAddress)
      }
    } catch (error) {
      console.error("Donation failed:", error)
      alert("Transaction failed. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!ngo) return <p>Loading campaign...</p>

  const progressPercentage = (ngo.totalRaised / ngo.goal) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/#" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <>
                <Badge variant="secondary">
                  {userAddress.substring(0, 6)}...{userAddress.slice(-4)}
                </Badge>
                <span className="text-sm font-medium text-gray-700">
                  Balance: {balance} {currentNetwork?.currency || 'S'}
                </span>
                {currentNetwork && (
                  <Badge variant="outline">{currentNetwork.name}</Badge>
                )}
              </>
            ) : (
              <Button onClick={connectWallet} className="bg-blue-600 text-white">
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NGO Info & History */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Campaign Info</TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <History className="w-4 h-4 mr-2" />
                  My Donations ({donationHistory.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={ngo.image || "/placeholder.svg"} />
                        <AvatarFallback>{ngo.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h1 className="text-2xl font-bold">{ngo.name}</h1>
                          {ngo.verified && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Star className="w-3 h-3" />
                              <span>Verified</span>
                            </Badge>
                          )}
                          <Badge variant="outline">Score: {ngo.score}</Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{ngo.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {ngo.location}
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {ngo.donors} donors
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="w-4 h-4 mr-1" />
                            Updated {ngo.lastUpdate}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fundraising Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Progress</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                        <Progress value={progressPercentage} className="h-3" />
                        <div className="flex justify-between text-sm text-gray-500 mt-2">
                          <span>${ngo.totalRaised.toLocaleString()} raised</span>
                          <span>Goal: ${ngo.goal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg">Donation History</CardTitle>
                    <Button variant="outline" size="sm" onClick={refreshHistory}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {donationHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No donations yet</p>
                        <p className="text-sm">Your donation history will appear here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {donationHistory.map((donation) => (
                          <div key={donation.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <DollarSign className="w-4 h-4 text-green-600" />
                                <span className="font-semibold">
                                  {donation.amount} {donation.currency}
                                </span>
                                <Badge 
                                  variant={
                                    donation.status === 'confirmed' ? 'default' :
                                    donation.status === 'pending' ? 'secondary' : 'destructive'
                                  }
                                >
                                  {donation.status}
                                </Badge>
                              </div>
                              <a
                                href={donation.explorerUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                              >
                                View on Explorer
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </div>
                            <div className="text-sm text-gray-500 space-y-1">
                              <div className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {donation.timestamp.toLocaleString()}
                              </div>
                              <div className="font-mono text-xs break-all">
                                TX: {donation.txHash}
                              </div>
                              {donation.blockNumber && (
                                <div className="text-xs">
                                  Block: {donation.blockNumber}
                                  {donation.gasUsed && ` • Gas: ${donation.gasUsed}`}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Make a Donation
                </CardTitle>
                <CardDescription>
                  Support this cause with a secure blockchain donation
                  {currentNetwork && (
                    <span className="block mt-1 text-xs">
                      Network: {currentNetwork.name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="amount">
                        Donation Amount ({currentNetwork?.currency || 'S'})
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.001"
                        placeholder="0.00"
                        value={donationData.amount}
                        onChange={(e) => handleInputChange("amount", e.target.value)}
                      />
                      {donationData.amount && (
                        <p className="text-xs text-gray-500 mt-1">
                          Available balance: {balance} {currentNetwork?.currency || 'S'}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Add a message to your donation..."
                        value={donationData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Donation Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Amount:</span>
                        <span className="font-semibold">
                          {donationData.amount} {currentNetwork?.currency || 'S'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Network:</span>
                        <span>{currentNetwork?.name || 'Sonic Blaze Testnet'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recipient:</span>
                        <span className="font-mono text-xs break-all">
                          {ngo.walletAddress}
                        </span>
                      </div>
                      {donationData.message && (
                        <div className="pt-2 border-t">
                          <span className="text-gray-600">Message:</span>
                          <p className="text-xs mt-1 p-2 bg-gray-50 rounded">
                            {donationData.message}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h4 className="text-lg font-semibold">Donation Submitted!</h4>
                    <p className="text-sm text-gray-600">
                      Your donation of {donationData.amount} {currentNetwork?.currency || 'S'} has been submitted to the blockchain.
                    </p>
                    {txHash && (
                      <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                        <p className="text-xs font-semibold">Transaction Hash:</p>
                        <p className="text-xs font-mono break-all">{txHash}</p>
                        <a
                          href={`${currentNetwork?.explorer || 'https://blaze.soniclabs.com'}tx/${txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                        >
                          View on Explorer
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-6 space-y-3">
                  {step < 3 ? (
                    <Button
                      onClick={handleDonate}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      disabled={!donationData.amount || Number.parseFloat(donationData.amount) <= 0 || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : step === 1 ? (
                        <>
                          <Heart className="w-4 h-4 mr-2" />
                          Continue to Payment
                        </>
                      ) : (
                        <>
                          <Wallet className="w-4 h-4 mr-2" />
                          Confirm Donation
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => {
                          setStep(1)
                          setTxHash("")
                          setDonationData(prev => ({ ...prev, amount: "", message: "" }))
                        }}
                        className="w-full"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Donate Again
                      </Button>
                      <Link href="/donor/dashboard">
                        <Button variant="outline" className="w-full">
                          Back to Dashboard
                        </Button>
                      </Link>
                    </div>
                  )}

                  {step > 1 && step < 3 && (
                    <Button 
                      variant="outline" 
                      onClick={() => setStep(step - 1)} 
                      className="w-full"
                      disabled={isLoading}
                    >
                      Back
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}