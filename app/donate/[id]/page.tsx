"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Heart, Shield, Users, MapPin, Star, Wallet, Eye, TrendingUp, CheckCircle } from "lucide-react"

export default function DonatePage() {
  const params = useParams()
  const ngoId = params.id

  const [donationData, setDonationData] = useState({
    amount: "",
    currency: "ETH",
    message: "",
    anonymous: false,
    recurring: false,
  })

  const [step, setStep] = useState(1) // 1: Details, 2: Payment, 3: Confirmation

  // Mock NGO data
  const ngo = {
    id: 1,
    name: "Education for All Foundation",
    description:
      "Providing quality education to underprivileged children worldwide through innovative programs, teacher training, and infrastructure development.",
    category: "Education",
    location: "Philippines",
    score: 95,
    totalRaised: 125000,
    goal: 200000,
    donors: 1250,
    image: "/placeholder.svg?height=120&width=120",
    verified: true,
    lastUpdate: "2 days ago",
    walletAddress: "0x742d35Cc6634C0532925a3b8D4C0C8b3C2e1e416",
    projects: [
      "School Building Project - 75% Complete",
      "Teacher Training Program - 60% Complete",
      "Digital Learning Initiative - 40% Complete",
    ],
    recentUpdates: [
      {
        date: "2025-01-08",
        title: "New classroom construction completed",
        description: "We've successfully completed the construction of 3 new classrooms serving 150 students.",
      },
      {
        date: "2025-01-05",
        title: "Teacher training milestone reached",
        description: "25 teachers have completed our modern education methodology training program.",
      },
    ],
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setDonationData((prev) => ({ ...prev, [field]: value }))
  }

  const handleDonate = () => {
    if (step < 3) {
      setStep(step + 1)
    } else {
      // Process donation
      console.log("Processing donation:", donationData)
      // Redirect to success page
      window.location.href = "/donation/success"
    }
  }

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
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D8</span>
            </div>
            <span className="text-xl font-bold text-gray-900">DON-8</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* NGO Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* NGO Header */}
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
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{ngo.donors}</div>
                      <div className="text-sm text-gray-500">Donors</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        ${(ngo.totalRaised / ngo.donors).toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-500">Avg. Donation</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{Math.round(progressPercentage)}%</div>
                      <div className="text-sm text-gray-500">Complete</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Projects */}
            <Card>
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Current initiatives your donation will support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {ngo.projects.map((project, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">{project}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Updates</CardTitle>
                <CardDescription>Latest progress reports from the organization</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ngo.recentUpdates.map((update, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium">{update.title}</h4>
                        <Badge variant="outline" className="text-xs">
                          {update.date}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{update.description}</p>
                    </div>
                  ))}
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
                    <div className="space-y-2">
                      <Label htmlFor="amount">Donation Amount</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="amount"
                          type="number"
                          step="0.001"
                          placeholder="0.00"
                          value={donationData.amount}
                          onChange={(e) => handleInputChange("amount", e.target.value)}
                          className="flex-1"
                        />
                        <Select
                          value={donationData.currency}
                          onValueChange={(value) => handleInputChange("currency", value)}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ETH">ETH</SelectItem>
                            <SelectItem value="BTC">BTC</SelectItem>
                            <SelectItem value="USDC">USDC</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-gray-500">
                        ≈ ${(Number.parseFloat(donationData.amount || "0") * 2500).toFixed(2)} USD
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "0.1")}>
                        0.1 ETH
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "0.5")}>
                        0.5 ETH
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "1.0")}>
                        1.0 ETH
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message (Optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Leave a message of support..."
                        value={donationData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        rows={3}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="anonymous"
                          checked={donationData.anonymous}
                          onCheckedChange={(checked) => handleInputChange("anonymous", checked as boolean)}
                        />
                        <Label htmlFor="anonymous" className="text-sm">
                          Donate anonymously
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recurring"
                          checked={donationData.recurring}
                          onCheckedChange={(checked) => handleInputChange("recurring", checked as boolean)}
                        />
                        <Label htmlFor="recurring" className="text-sm">
                          Make this a monthly donation
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Donation Summary</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Amount:</span>
                          <span>
                            {donationData.amount} {donationData.currency}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Network Fee:</span>
                          <span>~0.002 ETH</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-1">
                          <span>Total:</span>
                          <span>{(Number.parseFloat(donationData.amount) + 0.002).toFixed(3)} ETH</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Recipient Wallet</Label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs font-mono break-all">{ngo.walletAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>Secured by blockchain smart contracts</span>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4 text-center">
                    <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
                    <h4 className="text-lg font-semibold">Donation Confirmed!</h4>
                    <p className="text-sm text-gray-600">
                      Your donation of {donationData.amount} {donationData.currency} has been successfully processed.
                    </p>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs">Transaction Hash:</p>
                      <p className="text-xs font-mono">0x1234567890abcdef...</p>
                    </div>
                  </div>
                )}

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

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Shield className="w-3 h-3" />
                      <span>Blockchain Secured</span>
                    </div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>Zero Platform Fees</span>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <span>100% Transparent</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
