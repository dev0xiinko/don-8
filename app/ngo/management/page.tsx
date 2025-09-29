"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreateCampaignForm } from "@/components/create-campaign-form"
import { CampaignCard } from "@/components/campaign-card"
import { TransactionHistory } from "@/components/transaction-history"
import { WithdrawalHistory } from "@/components/withdrawal-history"
import { mockNGOData, type Campaign } from "@/lib/mock-data"
import { Heart, TrendingUp, Wallet } from "lucide-react"
import { getBalanceFromAddress } from "@/lib/metamask"

export default function NGODashboardPage() {
  const [ngoData, setNgoData] = useState(mockNGOData)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [isLoadingBalance, setIsLoadingBalance] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true)
      const balance = await getBalanceFromAddress(ngoData.walletAddress)
      setWalletBalance(balance)
      setIsLoadingBalance(false)
    }

    fetchBalance()
    const interval = setInterval(fetchBalance, 30000)

    return () => clearInterval(interval)
  }, [ngoData.walletAddress])

  const handleCampaignCreate = (campaignData: Omit<Campaign, "id" | "createdAt" | "status">) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    }

    setNgoData((prev) => ({
      ...prev,
      campaigns: [newCampaign, ...prev.campaigns],
    }))

    alert("Campaign created successfully!")
  }

  const handleReportUpload = (campaignId: string, file: File) => {
    setNgoData((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((campaign) =>
        campaign.id === campaignId ? { ...campaign, reportUrl: `/reports/${file.name}` } : campaign,
      ),
    }))

    alert(`Report "${file.name}" uploaded successfully!`)
  }

  const displayBalance = walletBalance ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">{ngoData.name}</h1>
            <p className="text-muted-foreground">Manage campaigns, track donations, and monitor impact</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">Wallet Balance</CardTitle>
              <Wallet className="h-5 w-5 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${displayBalance.toFixed(4)} ETH`
                )}
              </div>
              <p className="text-xs text-blue-100 mt-1">
                {ngoData.walletAddress.slice(0, 10)}...{ngoData.walletAddress.slice(-8)}
              </p>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Live balance
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-50">Reputation Score</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ngoData.reputationScore}/100</div>
              <p className="text-xs text-green-100 mt-1">Excellent standing</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-50">Active Campaigns</CardTitle>
              <Heart className="h-5 w-5 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ngoData.campaigns.filter((c) => c.status === "active").length}</div>
              <p className="text-xs text-purple-100 mt-1">{ngoData.campaigns.length} total campaigns</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign List</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <CreateCampaignForm onCampaignCreate={handleCampaignCreate} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Campaigns</h2>
              <p className="text-muted-foreground mb-6">View and manage your fundraising campaigns</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ngoData.campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} onReportUpload={handleReportUpload} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <TransactionHistory transactions={ngoData.transactions} />
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-6">
            <WithdrawalHistory withdrawals={ngoData.withdrawals} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
