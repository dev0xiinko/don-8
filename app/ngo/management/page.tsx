"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CreateCampaignForm } from "@/components/create-campaign-form";
import { CampaignCard } from "@/components/campaign-card";
import { TransactionHistory } from "@/components/transaction-history";
import { WithdrawalHistory } from "@/components/withdrawal-history";
import { mockNGOData, type Campaign } from "@/lib/mock-data";
import {
  Heart,
  TrendingUp,
  Wallet,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getBalanceFromAddress, connectWallet } from "@/lib/metamask";

export default function NGODashboardPage() {
  const [ngoData, setNgoData] = useState(mockNGOData);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [withdrawalResult, setWithdrawalResult] = useState<{
    success: boolean;
    txHash: "0xf53e39ccc497fe984565b0c3dafc6407c73d8c670237183003e069f9cbf8bfb9";
    message: string;
  } | null>(null);
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

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setConnectedWallet(accounts[0]);
          return accounts[0];
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
    return null;
  };

  const handleWithdrawFunds = async () => {
    // Check if wallet is connected
    if (!isWalletConnected || !walletInfo) {
      alert("Please connect your wallet first to proceed with withdrawal.");
      return;
    }

    // Open withdrawal modal
    setIsWithdrawModalOpen(true);
    setRecipientAddress(walletInfo.address);
  };

  const processWithdrawal = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert("Please enter a valid withdrawal amount.");
      return;
    }

    if (!recipientAddress) {
      alert("Please enter a recipient address.");
      return;
    }

    if (parseFloat(withdrawAmount) > (Number(walletInfo?.balance) || 0)) {
      alert("Insufficient balance for this withdrawal.");
      return;
    }

    setIsProcessingWithdrawal(true);

    try {
      // Simulate withdrawal processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Mock success result
      setWithdrawalResult({
        success: true,
        txHash:
          "0xf53e39ccc497fe984565b0c3dafc6407c73d8c670237183003e069f9cbf8bfb9",
        message: `Successfully withdrew ${withdrawAmount} ETH to ${recipientAddress.slice(
          0,
          10
        )}...${recipientAddress.slice(-8)}`,
      });

      // Update local balance (mock)
      setWalletBalance((prev) =>
        prev ? prev - parseFloat(withdrawAmount) : 0
      );

      // Add to withdrawal history
      const newWithdrawal = {
        id: Date.now().toString(),
        amount: parseFloat(withdrawAmount),
        destination: recipientAddress,
        txHash: mockTxHash,
        date: new Date().toISOString().split("T")[0],
        status: "completed" as const,
      };

      setNgoData((prev) => ({
        ...prev,
        withdrawals: [newWithdrawal, ...prev.withdrawals],
      }));
    } catch (error) {
      setWithdrawalResult({
        success: false,
        txHash:
          "0xf53e39ccc497fe984565b0c3dafc6407c73d8c670237183003e069f9cbf8bfb9",
        message: "Withdrawal failed. Please try again.",
      });
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  const resetWithdrawalModal = () => {
    setIsWithdrawModalOpen(false);
    setWithdrawAmount("");
    setRecipientAddress("");
    setWithdrawalResult(null);
    setIsProcessingWithdrawal(false);
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
      // Request account access
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
        setConnectedWallet(address);

        // Listen for account changes
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
      // User disconnected wallet
      handleDisconnectWallet();
    } else {
      // User switched accounts
      const address = accounts[0];
      const balance = await getWalletBalance(address);
      const { chainId, networkName } = await getNetworkInfo();

      setWalletInfo({
        address,
        balance,
        network: networkName,
        networkId: chainId,
      });
      setConnectedWallet(address);
    }
  };

  const handleChainChanged = async () => {
    // Reload wallet info when network changes
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
    setConnectedWallet(null);

    // Remove event listeners
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    }
  };

  // Check if wallet is already connected on component mount
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
            setConnectedWallet(address);

            // Set up event listeners
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            window.ethereum.on("chainChanged", handleChainChanged);
          }
        } catch (error) {
          console.error("Error checking existing connection:", error);
        }
      }
    };

    checkExistingConnection();

    // Cleanup event listeners on unmount
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

  const displayBalance = walletBalance ?? 0;

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

          <TabsContent value="create" className="space-y-6">
            <CreateCampaignForm onCampaignCreate={handleCampaignCreate} />
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Campaigns</h2>
              <p className="text-muted-foreground mb-6">
                View and manage your fundraising campaigns
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ngoData.campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  onReportUpload={handleReportUpload}
                />
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

      {/* Withdrawal Modal */}
      <Dialog open={isWithdrawModalOpen} onOpenChange={resetWithdrawalModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <span>Withdraw Funds</span>
            </DialogTitle>
            <DialogDescription>
              {!withdrawalResult
                ? "Transfer funds from your NGO wallet to your personal wallet"
                : withdrawalResult.success
                ? "Withdrawal completed successfully!"
                : "Withdrawal failed"}
            </DialogDescription>
          </DialogHeader>

          {!withdrawalResult ? (
            <div className="space-y-4">
              {/* Wallet Connection Status */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">
                    Wallet Status:
                  </span>
                  <Badge variant={isWalletConnected ? "default" : "secondary"}>
                    {isWalletConnected ? "Connected" : "Not Connected"}
                  </Badge>
                </div>
                {walletInfo && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-blue-600">
                      Address: {walletInfo.address.slice(0, 10)}...
                      {walletInfo.address.slice(-8)}
                    </p>
                    <p className="text-xs text-blue-600">
                      Balance: {walletInfo.balance} ETH
                    </p>
                    <p className="text-xs text-blue-600">
                      Network: {walletInfo.network}
                    </p>
                  </div>
                )}
              </div>

              {/* Current Balance */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Available Balance:
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    {walletInfo?.balance} ETH
                  </span>
                </div>
              </div>

              {/* Withdrawal Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount (ETH)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.0000"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  step="0.0001"
                  min="0"
                  max={displayBalance.toString()}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Min: 0.0001 ETH</span>
                  <button
                    type="button"
                    onClick={() => setWithdrawAmount(displayBalance.toString())}
                    className="text-blue-600 hover:underline"
                  >
                    Max: {walletInfo?.balance} ETH
                  </button>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This will default to your connected wallet address
                </p>
              </div>

              {/* Transaction Fee Notice */}
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium">Transaction Fee Notice</p>
                    <p>
                      Network gas fees will be deducted from your wallet.
                      Estimated fee: ~0.002 ETH
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Result Status */}
              <div
                className={`p-4 rounded-lg border ${
                  withdrawalResult.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center space-x-2">
                  {withdrawalResult.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-medium ${
                      withdrawalResult.success
                        ? "text-green-800"
                        : "text-red-800"
                    }`}
                  >
                    {withdrawalResult.message}
                  </span>
                </div>
              </div>

              {/* Transaction Details */}
              {withdrawalResult.success && withdrawalResult.txHash && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Amount:
                      </span>
                      <span className="text-sm font-mono">
                        {withdrawAmount} ETH
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        To:
                      </span>
                      <span className="text-sm font-mono">
                        {recipientAddress.slice(0, 10)}...
                        {recipientAddress.slice(-8)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">
                        Transaction Hash:
                      </span>
                      <span className="text-sm font-mono">
                        {withdrawalResult.txHash.slice(0, 10)}...
                        {withdrawalResult.txHash.slice(-8)}
                      </span>
                    </div>
                  </div>

                  {/* Etherscan Link */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() =>
                      window.open(
                        `https://etherscan.io/tx/${withdrawalResult.txHash}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {!withdrawalResult ? (
              <>
                <Button variant="outline" onClick={resetWithdrawalModal}>
                  Cancel
                </Button>
                <Button
                  onClick={processWithdrawal}
                  disabled={
                    isProcessingWithdrawal ||
                    !withdrawAmount ||
                    !recipientAddress
                  }
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isProcessingWithdrawal ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Withdraw Funds
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={resetWithdrawalModal} className="w-full">
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
