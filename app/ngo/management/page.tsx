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
import { mockNGOData, type Campaign } from "@/lib/mock-data";
import {
  Heart,
  TrendingUp,
  Wallet,
  Download,
} from "lucide-react";
import { getBalanceFromAddress } from "@/lib/metamask";

export default function NGODashboardPage() {
  const [ngoData, setNgoData] = useState(mockNGOData);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletInfo, setWalletInfo] = useState<{
    address: string;
    balance: string;
    network: string;
    networkId: string;
  } | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      const balance = await getBalanceFromAddress(ngoData.walletAddress);
      setWalletBalance(balance);
      setIsLoadingBalance(false);
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);

    return () => clearInterval(interval);
  }, [ngoData.walletAddress]);

  const handleCampaignCreate = (
    campaignData: Omit<Campaign, "id" | "createdAt" | "status">
  ) => {
    const newCampaign: Campaign = {
      ...campaignData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
      status: "active",
    };

    setNgoData((prev) => ({
      ...prev,
      campaigns: [newCampaign, ...prev.campaigns],
    }));

    alert("Campaign created successfully!");
  };

  const handleReportUpload = (campaignId: string, file: File) => {
    setNgoData((prev) => ({
      ...prev,
      campaigns: prev.campaigns.map((campaign) =>
        campaign.id === campaignId
          ? { ...campaign, reportUrl: `/reports/${file.name}` }
          : campaign
      ),
    }));

    alert(`Report "${file.name}" uploaded successfully!`);
  };

  const handleWithdrawFunds = async () => {
    if (!isWalletConnected || !walletInfo) {
      alert("Please connect your wallet first to proceed with withdrawal.");
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawalSuccess = (withdrawalData: any) => {
    setWalletBalance((prev) =>
      prev ? prev - withdrawalData.amount : 0
    );

    const newWithdrawal = {
      id: Date.now().toString(),
      amount: withdrawalData.amount,
      destination: withdrawalData.destination,
      txHash: withdrawalData.txHash,
      date: new Date().toISOString().split("T")[0],
      status: "completed" as const,
    };

    setNgoData((prev) => ({
      ...prev,
      withdrawals: [newWithdrawal, ...prev.withdrawals],
    }));
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
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  };

  const getWalletBalance = async (address: string): Promise<string> => {
    try {
      if (typeof window.ethereum !== "undefined") {
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        });
        const ethBalance = parseInt(balance, 16) / Math.pow(10, 18);
        return ethBalance.toFixed(4);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-balance mb-2">
              {ngoData.name}
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
                          {walletInfo?.balance} ETH
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
                  `${walletInfo?.balance} ETH`
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
                {ngoData.reputationScore}/100
              </div>
              <p className="text-xs text-green-100 mt-1">Excellent standing</p>
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
                {ngoData.campaigns.filter((c) => c.status === "active").length}
              </div>
              <p className="text-xs text-purple-100 mt-1">
                {ngoData.campaigns.length} total campaigns
              </p>
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

          <TabsContent value="create">
            <CreateCampaignTab onCampaignCreate={handleCampaignCreate} />
          </TabsContent>

          <TabsContent value="campaigns">
            <CampaignsTab
              campaigns={ngoData.campaigns}
              onReportUpload={handleReportUpload}
            />
          </TabsContent>

          <TabsContent value="transactions">
            <TransactionsTab transactions={ngoData.transactions} />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalsTab withdrawals={ngoData.withdrawals} />
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