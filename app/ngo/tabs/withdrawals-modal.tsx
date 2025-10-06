"use client";

import React, { useState, useEffect } from "react";
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
import {
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletInfo: {
    address: string;
    balance: string;
    network: string;
    networkId: string;
  } | null;
  isWalletConnected: boolean;
  onWithdrawalSuccess: (data: {
    amount: number;
    destination: string;
    txHash: string;
    newBalance?: string;
  }) => void;
}

const checkCampaignConstraints = async () => {
  try {
    // Get NGO info from session
    const ngoInfo = sessionStorage.getItem('ngo_info');
    if (!ngoInfo) return { canWithdraw: false, violatingCampaigns: [], totalCampaigns: 0 };
    
    const ngo = JSON.parse(ngoInfo);
    const ngoId = ngo.id || ngo.ngoId;
    
    // Use dedicated API endpoint for withdrawal constraint validation
    const response = await fetch(`/api/ngo/withdrawal-constraints?ngoId=${ngoId}`);
    const result = await response.json();
    
    if (!response.ok || !result.success) {
      console.error('Failed to check withdrawal constraints:', result.message);
      return { canWithdraw: false, violatingCampaigns: [], totalCampaigns: 0 };
    }
    
    return {
      canWithdraw: result.canWithdraw,
      violatingCampaigns: result.violatingCampaigns || [],
      totalCampaigns: result.totalCampaigns || 0,
      message: result.message
    };
    
  } catch (error) {
    console.error('Error checking campaign constraints:', error);
    return { canWithdraw: false, violatingCampaigns: [], totalCampaigns: 0 };
  }
};

export function WithdrawalModal({
  isOpen,
  onClose,
  walletInfo,
  isWalletConnected,
  onWithdrawalSuccess,
}: WithdrawalModalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState(
    walletInfo?.address || ""
  );
  const [campaignConstraints, setCampaignConstraints] = useState<{
    canWithdraw: boolean;
    violatingCampaigns: any[];
    totalCampaigns: number;
  }>({ canWithdraw: true, violatingCampaigns: [], totalCampaigns: 0 });
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
  
  // Check campaign constraints when modal opens
  useEffect(() => {
    if (isOpen) {
      checkCampaignConstraints().then(setCampaignConstraints);
    }
  }, [isOpen]);
  const [withdrawalResult, setWithdrawalResult] = useState<{
    success: boolean;
    txHash: string;
    message: string;
  } | null>(null);

  const resetModal = () => {
    setWithdrawAmount("");
    setRecipientAddress(walletInfo?.address || "");
    setWithdrawalResult(null);
    setIsProcessingWithdrawal(false);
    onClose();
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

    // Double-check campaign constraints before processing
    const constraintCheck = await checkCampaignConstraints();
    if (!constraintCheck.canWithdraw) {
      alert("Cannot withdraw: Some campaigns need updates. Please add campaign updates or reports first.");
      return;
    }

    setIsProcessingWithdrawal(true);

    try {
      // Check if Web3 is available
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask or Web3 wallet not detected');
      }

      // Get current accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No wallet accounts found');
      }

      const fromAddress = accounts[0];
      
      // Convert SONIC amount to Wei (18 decimals)
      const amountInWei = BigInt(Math.floor(parseFloat(withdrawAmount) * 1e18)).toString(16);
      
      // Prepare transaction parameters
      const transactionParameters = {
        to: recipientAddress,
        from: fromAddress,
        value: '0x' + amountInWei,
        gas: '0x5208', // 21000 gas limit for simple transfer
        gasPrice: null, // Let wallet determine gas price
      };

      // Send the transaction
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      if (!txHash) {
        throw new Error('Transaction was rejected or failed');
      }

      // Record the withdrawal in our system
      await recordWithdrawal({
        amount: parseFloat(withdrawAmount),
        destination: recipientAddress,
        txHash: txHash,
        fromAddress: fromAddress
      });

      // Success result with real transaction hash
      setWithdrawalResult({
        success: true,
        txHash: txHash,
        message: `Successfully withdrew ${withdrawAmount} SONIC to ${recipientAddress.slice(
          0,
          10
        )}...${recipientAddress.slice(-8)}`,
      });

      // Call success handler
      onWithdrawalSuccess({
        amount: parseFloat(withdrawAmount),
        destination: recipientAddress,
        txHash: txHash,
      });

      // Update wallet balance after successful transaction
      setTimeout(() => {
        updateWalletBalance();
      }, 2000); // Wait 2 seconds for blockchain confirmation

    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      let errorMessage = 'Withdrawal failed. Please try again.';
      
      if (error.code === 4001) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.code === -32603) {
        errorMessage = 'Insufficient funds for gas or transaction.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setWithdrawalResult({
        success: false,
        txHash: "",
        message: errorMessage,
      });
    } finally {
      setIsProcessingWithdrawal(false);
    }
  };

  // Record withdrawal in our backend system
  const recordWithdrawal = async (withdrawalData: {
    amount: number;
    destination: string; 
    txHash: string;
    fromAddress: string;
  }) => {
    try {
      const ngoInfo = sessionStorage.getItem('ngo_info');
      if (!ngoInfo) return;
      
      const ngo = JSON.parse(ngoInfo);
      
      await fetch('/api/ngo/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ngoId: ngo.id,
          ...withdrawalData,
          timestamp: new Date().toISOString(),
          currency: 'SONIC',
          network: walletInfo?.network || 'Sonic Network'
        })
      });
    } catch (error) {
      console.error('Failed to record withdrawal:', error);
    }
  };

  // Update wallet balance after successful withdrawal
  const updateWalletBalance = async () => {
    try {
      if (typeof window.ethereum !== 'undefined' && walletInfo?.address) {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [walletInfo.address, 'latest'],
        });
        const sonicBalance = parseInt(balance, 16) / Math.pow(10, 18); // Convert Wei to SONIC
        
        // Trigger a wallet info refresh in the parent component
        if (typeof onWithdrawalSuccess === 'function') {
          onWithdrawalSuccess({
            amount: parseFloat(withdrawAmount),
            destination: recipientAddress,
            txHash: withdrawalResult?.txHash || '',
            newBalance: sonicBalance.toFixed(4)
          });
        }
      }
    } catch (error) {
      console.error('Failed to update wallet balance:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetModal}>
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
                    Balance: {walletInfo.balance} SONIC
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
                  {walletInfo?.balance} SONIC
                </span>
              </div>
            </div>

            {/* Campaign Constraints Warning */}
            {!campaignConstraints.canWithdraw && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Withdrawal Restricted</h4>
                    <p className="text-sm text-red-600 mt-1">
                      You have {campaignConstraints.violatingCampaigns.length} campaign(s) that haven't been updated for more than 7 days since creation.
                    </p>
                    <div className="mt-2 space-y-1">
                      {campaignConstraints.violatingCampaigns.map((campaign: any) => (
                        <div key={campaign.id} className="text-xs text-red-500 bg-red-100 px-2 py-1 rounded">
                          <strong>{campaign.title}</strong> - {campaign.daysSinceCreation} days without updates
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-red-500 mt-2">
                      Please add campaign updates or reports to enable withdrawals.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Withdrawal Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (SONIC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.0000"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                step="0.0001"
                min="0"
                disabled={!campaignConstraints.canWithdraw}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min: 0.0001 SONIC</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(walletInfo?.balance || "0")}
                  className="text-blue-600 hover:underline disabled:text-gray-400"
                  disabled={!campaignConstraints.canWithdraw}
                >
                  Max: {walletInfo?.balance} SONIC
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
                    Estimated fee: ~0.002 SONIC
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
                      {withdrawAmount} SONIC
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

                {/* Blaze Sonic Labs Explorer Link */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    const getExplorerUrl = (networkId: string, txHash: string) => {
                      const explorers: { [key: string]: string } = {
                        '0x1': `https://etherscan.io/tx/${txHash}`,
                        '0x89': `https://polygonscan.com/tx/${txHash}`,
                        '0x38': `https://bscscan.com/tx/${txHash}`,
                        '0x439': `https://blaze.soniclabs.com/tx/${txHash}`, // Blaze Sonic Labs Testnet
                        '0x440': `https://blaze.soniclabs.com/tx/${txHash}`, // Blaze Sonic Labs Mainnet
                        '0xdede': `https://blaze.soniclabs.com/tx/${txHash}`, // Default Blaze Sonic
                      };
                      return explorers[networkId] || `https://blaze.soniclabs.com/tx/${txHash}`;
                    };
                    
                    const explorerUrl = getExplorerUrl(walletInfo?.networkId || '0xdede', withdrawalResult.txHash);
                    window.open(explorerUrl, "_blank");
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Blaze Sonic Labs
                </Button>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!withdrawalResult ? (
            <>
              <Button variant="outline" onClick={resetModal}>
                Cancel
              </Button>
              <Button
                onClick={processWithdrawal}
                disabled={
                  isProcessingWithdrawal ||
                  !withdrawAmount ||
                  !recipientAddress ||
                  !campaignConstraints.canWithdraw
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessingWithdrawal ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processing...
                  </>
                ) : !campaignConstraints.canWithdraw ? (
                  <>
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Update Campaigns to Enable
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Withdraw {withdrawAmount} SONIC
                  </>
                )}
              </Button>
            </>
          ) : (
            <Button onClick={resetModal} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}