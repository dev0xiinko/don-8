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
  Users,
  MapPin,
  Star,
  Wallet,
  History,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Clock,
  DollarSign,
  RefreshCw,
  FileText,
  File,
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

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string, params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      selectedAddress: string | null
    }
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
    currency: "S",
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
      reports: [
        {
          id: "1",
          name: "Annual_Report_2024.pdf",
          url: "/reports/Annual_Report_2024.pdf",
          uploadedAt: "2025-09-01"
        },
        {
          id: "2",
          name: "Impact_Analysis.docx",
          url: "/reports/Impact_Analysis.docx",
          uploadedAt: "2025-09-15"
        }
      ]
    })
  }, [ngoId])

  // --- Wallet / Network / Donation Functions ---
  const detectNetwork = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const network = await provider.getNetwork()
        const chainId = Number(network.chainId)
        const networkInfo = SUPPORTED_NETWORKS[chainId]
        if (networkInfo) {
          setCurrentNetwork(networkInfo)
          setDonationData(prev => ({ ...prev, currency: networkInfo.currency }))
        } else {
          setCurrentNetwork({
            chainId,
            name: `Unknown Network (${chainId})`,
            currency: 'S',
            explorer: 'https://blaze.soniclabs.com',
            rpcUrl: ''
          })
        }
      } catch (error) {
        console.error(error)
      }
    }
  }

  const connectWallet = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setUserAddress(accounts[0])
        setWalletConnected(true)
        await detectNetwork()
        await fetchBalance(accounts[0])
        loadDonationHistory(accounts[0])
      } catch (error) {
        console.error(error)
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.")
    }
  }

  const fetchBalance = async (address: string) => {
    if (!window.ethereum) return
    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balanceBigInt = await provider.getBalance(address)
      setBalance(parseFloat(ethers.formatEther(balanceBigInt)).toFixed(4))
    } catch (err) {
      console.error(err)
    }
  }

  const loadDonationHistory = (address: string) => {
    const savedHistory = localStorage.getItem(`donation_history_${address.toLowerCase()}`)
    if (savedHistory) {
      const history = JSON.parse(savedHistory).map((item: any) => ({ ...item, timestamp: new Date(item.timestamp) }))
      setDonationHistory(history)
    }
  }

  const saveDonationHistory = (address: string, history: DonationHistory[]) => {
    localStorage.setItem(`donation_history_${address.toLowerCase()}`, JSON.stringify(history))
  }

  const handleDonate = async () => {
    if (!walletConnected) { alert("Connect wallet first."); return }
    if (step < 2) { setStep(step + 1); return }

    setIsLoading(true)
    try {
      const provider = new ethers.BrowserProvider(window.ethereum!)
      const signer = await provider.getSigner()
      const recipient = ethers.getAddress(ngo.walletAddress)

      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(donationData.amount || "0"),
      })

      setTxHash(tx.hash)

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

      const receipt = await tx.wait()
      if (receipt) {
        setDonationHistory(prev => prev.map(d => d.txHash === tx.hash ? { ...d, status: receipt.status === 1 ? 'confirmed' : 'failed' } : d))
        await fetchBalance(userAddress)
      }
    } catch (err) {
      console.error(err)
      alert("Transaction failed.")
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
                <Badge variant="secondary">{userAddress.substring(0, 6)}...{userAddress.slice(-4)}</Badge>
                <span className="text-sm font-medium text-gray-700">
                  Balance: {balance} {currentNetwork?.currency || 'S'}
                </span>
                {currentNetwork && <Badge variant="outline">{currentNetwork.name}</Badge>}
              </>
            ) : (
              <Button onClick={connectWallet} className="bg-blue-600 text-white">Connect Wallet</Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Bar */}
            <Card>
              <CardHeader><CardTitle>Fundraising Progress</CardTitle></CardHeader>
              <CardContent>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>${ngo.totalRaised.toLocaleString()} raised</span>
                  <span>Goal: ${ngo.goal.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Reports Section */}
            {ngo.reports && ngo.reports.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4">Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {ngo.reports.map((report: any) => {
                    const ext = report.name.split(".").pop()?.toLowerCase()
                    let IconComponent = File
                    if (ext === "pdf" || ["doc", "docx"].includes(ext!)) IconComponent = FileText
                    return (
                      <Card key={report.id} className="hover:shadow-lg transition-shadow">
                        <CardContent className="flex flex-col justify-between space-y-3">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium text-gray-700">{report.name}</h4>
                              <p className="text-xs text-gray-500">
                                Uploaded on {new Date(report.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={report.url}
                            download
                            className="inline-flex items-center justify-center bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition"
                          >
                            Download <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tabs for Info / History */}
            <Tabs defaultValue="info" className="w-full mt-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="info">Campaign Info</TabsTrigger>
                <TabsTrigger value="history" className="flex items-center">
                  <History className="w-4 h-4 mr-2" /> History Donations ({donationHistory.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                {/* Campaign Info Card */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={ngo.image || "/placeholder.svg"} />
                        <AvatarFallback>{ngo.name.substring(0,2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h1 className="text-2xl font-bold">{ngo.name}</h1>
                          {ngo.verified && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4" /> Verified
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600">{ngo.description}</p>
                        <div className="flex items-center mt-4 space-x-4 text-sm text-gray-500">
                          <span><Users className="w-4 h-4 mr-1 inline" /> {ngo.donors} Donors</span>
                          <span><DollarSign className="w-4 h-4 mr-1 inline" /> Goal: ${ngo.goal.toLocaleString()}</span>
                          <span><Clock className="w-4 h-4 mr-1 inline" /> Last Update: {ngo.lastUpdate}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                {donationHistory.length === 0 ? (
                  <p className="text-gray-500">No donation history yet.</p>
                ) : (
                  donationHistory.map(d => (
                    <Card key={d.id}>
                      <CardContent className="flex justify-between items-center">
                        <div>
                          <p>{d.amount} {d.currency}</p>
                          <p className="text-xs text-gray-500">{d.timestamp.toLocaleString()}</p>
                        </div>
                        <a href={d.explorerUrl} target="_blank" className="text-blue-600 hover:underline flex items-center">
                          View <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Donation Form */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" /> Make a Donation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Amount ({currentNetwork?.currency || 'S'})</Label>
                  <Input
                    type="number"
                    value={donationData.amount}
                    onChange={e => setDonationData({ ...donationData, amount: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Message (optional)</Label>
                  <Textarea
                    value={donationData.message}
                    onChange={e => setDonationData({ ...donationData, message: e.target.value })}
                  />
                </div>
                <Button onClick={handleDonate} disabled={isLoading}>
                  {isLoading ? "Processing..." : "Donate"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
