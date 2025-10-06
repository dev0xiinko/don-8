"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, ExternalLink, RefreshCw, Download } from "lucide-react";

interface WithdrawalRecord {
  id: string;
  ngoId: number;
  amount: number;
  currency: string;
  destination: string;
  fromAddress: string;
  txHash: string;
  network: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  blockchainConfirmed: boolean;
  createdAt: string;
}

interface WithdrawalsTabProps {
  withdrawals?: any[]; // Keep for backward compatibility
}

export function WithdrawalsTab({ withdrawals: propWithdrawals }: WithdrawalsTabProps) {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithdrawals = async (showRefreshing = false) => {
    try {
      if (showRefreshing) setRefreshing(true);
      
      // Get NGO info from session
      const ngoInfo = sessionStorage.getItem('ngo_info');
      if (!ngoInfo) {
        setWithdrawals([]);
        return;
      }
      
      const ngo = JSON.parse(ngoInfo);
      const ngoId = ngo.id || ngo.ngoId;
      
      const response = await fetch(`/api/ngo/withdrawals?ngoId=${ngoId}`);
      const result = await response.json();
      
      if (result.success) {
        setWithdrawals(result.withdrawals || []);
        console.log(`✅ Loaded ${result.withdrawals?.length || 0} withdrawals for NGO ${ngoId}`);
      } else {
        console.error('❌ Failed to fetch withdrawals:', result.message);
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('❌ Error fetching withdrawals:', error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchWithdrawals(false);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Completed",
          className: "bg-green-500 text-white",
        };
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500 text-white",
        };
      case "failed":
        return {
          icon: XCircle,
          label: "Failed",
          className: "bg-red-500 text-white",
        };
      default:
        return {
          icon: Clock,
          label: "Unknown",
          className: "bg-gray-500 text-white",
        };
    }
  };

  const openTransaction = (txHash: string, network: string) => {
    const getExplorerUrl = (network: string, txHash: string) => {
      if (network.toLowerCase().includes('sonic') || network.includes('Blaze')) {
        return `https://blaze.soniclabs.com/tx/${txHash}`;
      }
      // Fallback explorers for other networks
      if (network.toLowerCase().includes('polygon')) {
        return `https://polygonscan.com/tx/${txHash}`;
      }
      if (network.toLowerCase().includes('bsc')) {
        return `https://bscscan.com/tx/${txHash}`;
      }
      // Default to Sonic Labs
      return `https://blaze.soniclabs.com/tx/${txHash}`;
    };
    
    const explorerUrl = getExplorerUrl(network, txHash);
    window.open(explorerUrl, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading withdrawal history...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Withdrawal History
              </CardTitle>
              <CardDescription>
                Track all SONIC withdrawals and their blockchain status
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchWithdrawals(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Download className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No Withdrawals Yet</p>
              <p className="text-sm">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => {
                const statusConfig = getStatusConfig(withdrawal.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="font-medium text-lg">
                          {withdrawal.amount.toFixed(4)} {withdrawal.currency || 'SONIC'}
                        </p>
                        <Badge className={statusConfig.className}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                        {withdrawal.blockchainConfirmed && (
                          <Badge variant="outline" className="text-xs">
                            Confirmed
                          </Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">To:</span>{" "}
                          <span className="font-mono text-xs">
                            {withdrawal.destination.slice(0, 10)}...{withdrawal.destination.slice(-8)}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">Network:</span> {withdrawal.network}
                        </div>
                        <div>
                          <span className="font-medium">Date:</span>{" "}
                          {new Date(withdrawal.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div>
                          <span className="font-medium">Tx Hash:</span>{" "}
                          <span className="font-mono text-xs">
                            {withdrawal.txHash.slice(0, 10)}...{withdrawal.txHash.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTransaction(withdrawal.txHash, withdrawal.network)}
                        className="text-xs"
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Tx
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
