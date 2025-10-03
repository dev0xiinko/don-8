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
} from "lucide-react"

export default function DonatePage() {
  const params = useParams()
  const ngoId = params.id

  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState<string>("")
  const [balance, setBalance] = useState<string>("0.0")
  const [txHash, setTxHash] = useState<string>("")
  const [donationData, setDonationData] = useState({
    amount: "",
    currency: "ETH",
    message: "",
    anonymous: false,
    recurring: false,
  })
  const [step, setStep] = useState(1)

  // ✅ Mock NGO data (replace with API later)
  const [ngo, setNgo] = useState<any>(null)

  useEffect(() => {
    setNgo({
      id: ngoId,
      name: "Emergency Relief for Flood Victims",
      description: "Providing immediate shelter, food, and medical aid to families affected by recent flooding in rural communities.",
      category: "Emergency Relief",
      location: "Philippines",
      score: 95,
      totalRaised: 125000,
      goal: 200000,
      donors: 1250,
      image: "/flood.png",
      verified: true,
      lastUpdate: "2 days ago",
      walletAddress: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416",
    })
  }, [ngoId])

  // ✅ Detect if wallet is already connected
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
            await fetchBalance(accounts[0])
          }
        } catch (err) {
          console.error("Failed to check wallet connection:", err)
        }
      }
    }
    checkConnection()
  }, [])

  // ✅ Connect wallet manually
  const connectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        })
        setUserAddress(accounts[0])
        setWalletConnected(true)
        await fetchBalance(accounts[0])
      } catch (err) {
        console.error("Wallet connection rejected", err)
      }
    } else {
      alert("MetaMask not detected. Please install MetaMask.")
    }
  }

  // ✅ Fetch balance
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setDonationData((prev) => ({ ...prev, [field]: value }))
  }

  // ✅ Handle donation transaction
  const handleDonate = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet first.")
      return
    }

    if (step < 2) {
      setStep(step + 1)
      return
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()

      const tx = await signer.sendTransaction({
        to: ngo.walletAddress,
        value: ethers.parseEther(donationData.amount || "0"),
      })

      console.log("Transaction:", tx)
      setTxHash(tx.hash)
      setStep(3)

      // refresh balance after donating
      await fetchBalance(userAddress)
    } catch (error) {
      console.error("Donation failed:", error)
      alert("Transaction failed. Check console for details.")
    }
  }

  if (!ngo) return <p>Loading campaign...</p>

  const progressPercentage = (ngo.totalRaised / ngo.goal) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/donor/dashboard" className="flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center space-x-4">
            {walletConnected ? (
              <>
                <Badge variant="secondary">
                  {userAddress.substring(0, 6)}...{userAddress.slice(-4)}
                </Badge>
                <span className="text-sm font-medium text-gray-700">Balance: {balance} ETH</span>
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
          {/* NGO Info */}
          <div className="lg:col-span-2 space-y-6">
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
            
          </div>
          
          

          {/* Donation Form */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-red-500" />
                  Make a Donation
                </CardTitle>
                <CardDescription>Support this cause with a secure blockchain donation</CardDescription>
              </CardHeader>
              <CardContent>
                {step === 1 && (
                  <div className="space-y-4">
                    <Label htmlFor="amount">Donation Amount</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.001"
                      placeholder="0.00"
                      value={donationData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <h4 className="font-medium">Donation Summary</h4>
                    <div className="flex justify-between text-sm">
                      <span>Amount:</span>
                      <span>{donationData.amount} ETH</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Recipient:</span>
                      <span className="font-mono text-xs">{ngo.walletAddress}</span>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h4 className="text-lg font-semibold">Donation Confirmed!</h4>
                    <p className="text-sm text-gray-600">
                      Your donation of {donationData.amount} ETH has been successfully processed.
                    </p>
                    {txHash && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs">Transaction Hash:</p>
                        <p className="text-xs font-mono break-all">{txHash}</p>
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
                      disabled={!donationData.amount || Number.parseFloat(donationData.amount) <= 0}
                    >
                      {step === 1 ? (
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
                      <Link href="/donor/dashboard">
                        <Button className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          Track Donation
                        </Button>
                      </Link>
                      <Link href="/donor/dashboard">
                        <Button variant="outline" className="w-full bg-transparent">
                          Back to Dashboard
                        </Button>
                      </Link>
                    </div>
                  )}

                  {step > 1 && step < 3 && (
                    <Button variant="outline" onClick={() => setStep(step - 1)} className="w-full">
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
