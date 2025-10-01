"use client";

import { useState } from "react";
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
  }) => void;
}

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
  const [isProcessingWithdrawal, setIsProcessingWithdrawal] = useState(false);
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

    setIsProcessingWithdrawal(true);

    try {
      // Simulate withdrawal processing
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate mock transaction hash
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      // Mock success result
      setWithdrawalResult({
        success: true,
        txHash: mockTxHash,
        message: `Successfully withdrew ${withdrawAmount} ETH to ${recipientAddress.slice(
          0,
          10
        )}...${recipientAddress.slice(-8)}`,
      });

      // Call success handler
      onWithdrawalSuccess({
        amount: parseFloat(withdrawAmount),
        destination: recipientAddress,
        txHash: mockTxHash,
      });
    } catch (error) {
      setWithdrawalResult({
        success: false,
        txHash: "",
        message: "Withdrawal failed. Please try again.",
      });
    } finally {
      setIsProcessingWithdrawal(false);
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
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Min: 0.0001 ETH</span>
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(walletInfo?.balance || "0")}
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
              <Button variant="outline" onClick={resetModal}>
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
            <Button onClick={resetModal} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}