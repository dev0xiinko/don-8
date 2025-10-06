"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignTab } from "@/app/ngo/tabs/create-campaign-tab";
import { CampaignsTab } from "@/app/ngo/tabs/campaign-tab";
import { TransactionsTab } from "@/app/ngo/tabs/transaction-tab";
import { WithdrawalsTab } from "@/app/ngo/tabs/withdrawals-tab";
import { WithdrawalModal } from "@/app/ngo/tabs/withdrawals-modal";
import NGOScoring from "@/components/ngo-scoring";
import { mockNGOData, type Campaign } from "@/lib/mock-data";
import {
  Heart,
  TrendingUp,
  Wallet,
  Download,
  Award,
} from "lucide-react";
import { getBalanceFromAddress } from "@/lib/metamask";

export default function NGODashboardPage() {
  const [ngoData, setNgoData] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [reputationScore, setReputationScore] = useState<number>(0);
  const [isLoadingReputation, setIsLoadingReputation] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: string;
    network: string;
    networkId: string;
  } | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [withdrawalRefreshKey, setWithdrawalRefreshKey] = useState(0);

  // Fetch live reputation score from transparency system
  const fetchReputationScore = async (ngoId: number) => {
    try {
      setIsLoadingReputation(true);
      const response = await fetch(`/api/ngo-scores?ngoId=${ngoId}`);
      const result = await response.json();
      
      if (result.success && result.score) {
        setReputationScore(result.score.currentScore || 0);
        console.log(`✅ Reputation score loaded for NGO ${ngoId}: ${result.score.currentScore}`);
      } else {
        console.log(`⚠️ No reputation score found for NGO ${ngoId}, using default`);
        setReputationScore(0);
      }
    } catch (error) {
      console.error('❌ Error fetching reputation score:', error);
      setReputationScore(0);
    } finally {
      setIsLoadingReputation(false);
    }
  };

  // Load NGO data from session storage on component mount
  useEffect(() => {
    const loadNgoData = () => {
      if (typeof window !== 'undefined') {
        const ngoLoggedIn = sessionStorage.getItem('ngo_logged_in');
        const ngoInfo = sessionStorage.getItem('ngo_info');
        
        if (ngoLoggedIn === 'true' && ngoInfo) {
          try {
            const parsedNgoInfo = JSON.parse(ngoInfo);
            console.log('🏢 NGO Session Info:', parsedNgoInfo);
            setNgoData(parsedNgoInfo);
            // Use the correct ID field from session
            const ngoId = parsedNgoInfo.id || parsedNgoInfo.ngoId;
            console.log(`🔍 Using NGO ID for data fetch: ${ngoId}`);
            fetchNgoCampaigns(ngoId);
            fetchReputationScore(ngoId);
          } catch (error) {
            console.error('Error parsing NGO info:', error);
            // Redirect to login if data is corrupted
            window.location.href = '/ngo/login';
          }
        } else {
          // Redirect to login if not logged in
          window.location.href = '/ngo/login';
        }
      }
      setIsLoading(false);
    };

    loadNgoData();
  }, []);

  // Fetch campaigns for the specific NGO
  const fetchNgoCampaigns = async (ngoId: number) => {
    try {
      console.log(`🔄 Fetching campaigns for NGO ID: ${ngoId}`);
      const response = await fetch(`/api/ngo/campaigns?ngoId=${ngoId}`);
      const result = await response.json();
      if (result.success) {
        console.log(`✅ Found ${result.campaigns.length} campaigns for NGO ${ngoId}:`, result.campaigns);
        setCampaigns(result.campaigns);
      } else {
        console.error('❌ Failed to fetch campaigns:', result);
      }
    } catch (error) {
      console.error('❌ Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      if (!ngoData?.walletAddress) return;
      
      setIsLoadingBalance(true);
      const balance = await getBalanceFromAddress(ngoData.walletAddress);
      setWalletBalance(balance);
      setIsLoadingBalance(false);
    };

    if (ngoData) {
      fetchBalance();
      const interval = setInterval(fetchBalance, 30000);
      return () => clearInterval(interval);
    }
  }, [ngoData?.walletAddress]);

  const handleCampaignCreate = async (
    campaignData: Omit<Campaign, "id" | "createdAt" | "status">
  ) => {
    if (!ngoData) return;

    try {
      const campaignPayload = {
        ...campaignData,
        ngoId: ngoData.id,
        ngoName: ngoData.organizationName,
        walletAddress: ngoData.walletAddress
      };

      const response = await fetch('/api/ngo/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(campaignPayload),
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Campaign created successfully:', result.campaign);
        // Refresh the campaigns list using the correct ID
        const ngoId = ngoData.id || ngoData.ngoId;
        await fetchNgoCampaigns(ngoId);
        console.log('🔄 Campaign list refreshed after creation');
      } else {
        console.error('❌ Failed to create campaign:', result.message);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }

    alert("Campaign created successfully!");
  };

  const handleReportUpload = async (campaignId: string, file: File, reportType?: string, description?: string) => {
    try {
      const formData = new FormData()
      formData.append('report', file)
      formData.append('reportType', reportType || 'progress')
      formData.append('description', description || '')

      const response = await fetch(`/api/campaigns/${campaignId}/reports`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (result.success) {
        // Update campaign's lastUpdated timestamp to trigger real-time updates on campaign page
        try {
          await fetch(`/api/campaigns/${campaignId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'update_timestamp',
              source: 'report_upload',
              reportName: file.name
            })
          })
        } catch (timestampError) {
          console.error('Error updating campaign timestamp:', timestampError)
        }
        
        // Refresh the campaigns list to show the new report
        if (ngoData?.id) {
          await fetchNgoCampaigns(ngoData.id)
        }
        
        alert(`Report "${file.name}" uploaded successfully!`)
        
        // Update NGO scoring for posting a report (counts as an update)
        try {
          await fetch('/api/ngo-scores', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ngoId: ngoData.id,
              type: 'update',
              campaignId: campaignId,
              updateTitle: `Report Upload: ${file.name}`,
              updateContent: `Uploaded ${reportType || 'progress'} report: ${description || file.name}`
            })
          })
        } catch (scoreError) {
          console.error('Error updating NGO score for report upload:', scoreError)
        }
      } else {
        alert(`Failed to upload report: ${result.message}`)
      }
    } catch (error) {
      console.error('Error uploading report:', error)
      alert('Failed to upload report. Please try again.')
    }
  };

  const handleUpdateAdded = async (campaignId: string | number) => {
    // Update campaign's lastUpdated timestamp to trigger real-time updates on campaign page
    try {
      await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'update_timestamp',
          source: 'campaign_update'
        })
      })
    } catch (timestampError) {
      console.error('Error updating campaign timestamp:', timestampError)
    }

    // Refresh the campaigns to get the latest updates
    if (ngoData?.id) {
      await fetchNgoCampaigns(ngoData.id);
    }

    // Update NGO scoring - record update event
    try {
      await fetch('/api/ngo-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoId: ngoData.id,
          type: 'update',
          campaignId: campaignId.toString()
        })
      });
    } catch (error) {
      console.error('Error updating NGO score for campaign update:', error);
    }
  };

  const handleWithdrawFunds = async () => {
    if (!isWalletConnected || !walletInfo) {
      alert("Please connect your wallet first to proceed with withdrawal.");
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawalSuccess = async (withdrawalData: any) => {
    // Update wallet balance - use newBalance if provided, otherwise calculate
    if (withdrawalData.newBalance) {
      setWalletInfo((prev) => prev ? { ...prev, balance: withdrawalData.newBalance } : null);
    } else {
      setWalletBalance((prev) =>
        prev ? prev - withdrawalData.amount : 0
      );
    }

    const newWithdrawal = {
      id: Date.now().toString(),
      amount: withdrawalData.amount,
      destination: withdrawalData.destination,
      txHash: withdrawalData.txHash,
      date: new Date().toISOString().split("T")[0],
      status: "completed" as const,
      network: "Blaze Sonic Labs",
      currency: "SONIC"
    };

    setNgoData((prev: typeof ngoData) => ({
      ...prev,
      withdrawals: [newWithdrawal, ...(prev?.withdrawals ?? [])],
    }));

    // Refresh reputation score after withdrawal (it should increase by +3 points)
    const ngoInfo = JSON.parse(sessionStorage.getItem('ngo_info') || '{}');
    if (ngoInfo.id) {
      await fetchReputationScore(ngoInfo.id);
      console.log('🔄 Reputation score refreshed after withdrawal');
    }

    // Update NGO scoring - record withdrawal event
    try {
      await fetch('/api/ngo-scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoId: ngoData.id,
          type: 'withdrawal',
          campaignId: withdrawalData.campaignId || 'general', // Can be passed from withdrawal modal
          withdrawalAmount: withdrawalData.amount,
          txHash: withdrawalData.txHash
        })
      });
    } catch (error) {
      console.error('Error updating NGO score for withdrawal:', error);
    }
    
    // Trigger withdrawal tab refresh
    setWithdrawalRefreshKey(prev => prev + 1);
  };

    const getNetworkName = (chainId: string): string => {
    const networks: { [key: string]: string } = {
      "0x1": "Ethereum Mainnet",
      "0x5": "Goerli Testnet", 
      "0x11155111": "Sepolia Testnet",
      "0x89": "Polygon Mainnet",
      "0x13881": "Polygon Mumbai",
      "0xa": "Optimism",
      "0xa4b1": "Arbitrum One",
      "0x38": "BSC Mainnet",
      "0x61": "BSC Testnet",
      "0x439": "Blaze Sonic Labs Testnet",
      "0x440": "Blaze Sonic Labs Mainnet",
      "0xdede": "Blaze Sonic Labs",
    };
    return networks[chainId] || "Blaze Sonic Labs";
  };

  const getWalletBalance = async (address: string): Promise<string> => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const sonicBalance = parseInt(balance, 16) / Math.pow(10, 18);
        return sonicBalance.toFixed(4);
      }
      return "0.0000";
    } catch (error) {
      console.error("Error getting balance:", error);
      return "0.0000";
    }
  };

  const getNetworkInfo = async (): Promise<{
    chainId: string;
    networkName: string;
  }> => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        const networkName = getNetworkName(chainId);
        return { chainId, networkName };
      }
      return { chainId: "0x1", networkName: "Ethereum Mainnet" };
    } catch (error) {
      console.error("Error getting network info:", error);
      return { chainId: "0x1", networkName: "Ethereum Mainnet" };
    }
  };

  const handleConnectWallet = async () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed. Please install MetaMask to continue.");
      return;
    }

    setIsConnectingWallet(true);

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await getWalletBalance(address);
        const { chainId, networkName } = await getNetworkInfo();

        setWalletInfo({
          address,
          balance,
          network: networkName,
          networkId: chainId,
        });

        setIsWalletConnected(true);

        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnectingWallet(false);
    }
  };

  const handleAccountsChanged = async (accounts: string[]) => {
    if (accounts.length === 0) {
      handleDisconnectWallet();
    } else {
      const address = accounts[0];
      const balance = await getWalletBalance(address);
      const { chainId, networkName } = await getNetworkInfo();

      setWalletInfo({
        address,
        balance,
        network: networkName,
        networkId: chainId,
      });
    }
  };

  const handleChainChanged = async () => {
    if (walletInfo) {
      const balance = await getWalletBalance(walletInfo.address);
      const { chainId, networkName } = await getNetworkInfo();

      setWalletInfo((prev) =>
        prev
          ? {
              ...prev,
              balance,
              network: networkName,
              networkId: chainId,
            }
          : null
      );
    }
  };

  const handleDisconnectWallet = () => {
    setIsWalletConnected(false);
    setWalletInfo(null);

    if (typeof window.ethereum !== "undefined") {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }
  };

  useEffect(() => {
    const checkExistingConnection = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          const accounts = await window.ethereum.request({
            method: "eth_accounts",
          });
          if (accounts.length > 0) {
            const address = accounts[0];
            const balance = await getWalletBalance(address);
            const { chainId, networkName } = await getNetworkInfo();

            setWalletInfo({
              address,
              balance,
              network: networkName,
              networkId: chainId,
            });

            setIsWalletConnected(true);

            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingConnection();

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, []);

  if (isLoading || !ngoData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading NGO dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-6">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">
              {ngoData.organizationName}
            </h1>
            <p className="text-muted-foreground">
              Manage campaigns, track donations, and monitor impact
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {!isWalletConnected ? (
              <Button
                onClick={handleConnectWallet}
                disabled={isConnectingWallet}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConnectingWallet ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                  </>
                )}
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Card className="p-3 bg-white border shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-gray-900">
                          {walletInfo?.address.slice(0, 6)}...
                          {walletInfo?.address.slice(-4)}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className="text-gray-600 font-semibold">
                          {walletInfo?.balance} SONIC
                        </span>
                        <span className="text-xs text-gray-500">
                          {walletInfo?.network}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDisconnectWallet}
                      className="text-gray-500 hover:text-red-600"
                    >
                      ×
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-50">
                Wallet Balance
              </CardTitle>
              <Wallet className="h-5 w-5 text-blue-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingBalance ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${walletInfo?.balance} SONIC`
                )}
              </div>
              <p className="text-xs text-blue-100 mt-1">
                {walletInfo?.address.slice(0, 10)}...
                {walletInfo?.address.slice(-8)}
              </p>
              <p className="text-xs text-blue-100 mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Live balance
              </p>
              <Button
                onClick={handleWithdrawFunds}
                className="mt-3 bg-white/20 hover:bg-white/30 text-white border border-white/30 text-sm h-8"
                size="sm"
              >
                <Download className="w-3 h-3 mr-1" />
                Withdraw Funds
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-50">
                Reputation Score
              </CardTitle>
              <TrendingUp className="h-5 w-5 text-green-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {isLoadingReputation ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  `${reputationScore}`
                )}
              </div>
              <p className="text-xs text-green-100 mt-1">
                {reputationScore >= 80 ? 'Excellent standing' : 
                 reputationScore >= 60 ? 'Good standing' : 
                 reputationScore >= 40 ? 'Fair standing' : 'Needs improvement'}
              </p>
              <p className="text-xs text-green-100 mt-2 flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                Live score
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-purple-50">
                Active Campaigns
              </CardTitle>
              <Heart className="h-5 w-5 text-purple-100" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {campaigns.filter((c) => c.status === "active").length}
              </div>
              <p className="text-xs text-purple-100 mt-1">
                {campaigns.length} total campaigns
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="create">Create Campaign</TabsTrigger>
            <TabsTrigger value="campaigns">Campaign List</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="scoring">
              <Award className="w-4 h-4 mr-1" />
              Reputation Score
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <CreateCampaignTab onCampaignCreate={handleCampaignCreate} />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab
              campaigns={campaigns}
              onReportUpload={handleReportUpload}
              onUpdateAdded={handleUpdateAdded}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab transactions={ngoData.transactions} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalsTab key={withdrawalRefreshKey} withdrawals={ngoData.withdrawals} />
          </TabsContent>

          <TabsContent value="scoring">
            <NGOScoring 
              ngoId={ngoData.id} 
              ngoName={ngoData.organizationName} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Withdrawal Modal */}
      <WithdrawalModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        walletInfo={walletInfo}
        isWalletConnected={isWalletConnected}
        onWithdrawalSuccess={handleWithdrawalSuccess}
      />
    </div>
  );
}