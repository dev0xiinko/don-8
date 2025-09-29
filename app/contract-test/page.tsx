'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ContractInteraction from '@/components/ContractInteraction';
import { connectWallet, getWalletInfo } from '@/lib/wallet-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getContractAddress } from '@/lib/contract-utils';

export default function ContractTestPage() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string>('');
  const contractAddress = getContractAddress('84532'); // Base Sepolia

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setError('');
    try {
      const address = await connectWallet();
      setWalletAddress(address);
      const { chainId: currentChainId } = await getWalletInfo();
      setChainId(currentChainId);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const { address, chainId: currentChainId } = await getWalletInfo();
        if (address) {
          setWalletAddress(address);
          setChainId(currentChainId);
        }
      } catch (err) {
        console.error('Error checking wallet connection:', err);
      }
    };

    checkWalletConnection();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Contract Integration Test</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your MetaMask wallet to interact with the contract</CardDescription>
        </CardHeader>
        <CardContent>
          {walletAddress ? (
            <div className="space-y-2">
              <p><strong>Connected Address:</strong> {walletAddress}</p>
              <p><strong>Chain ID:</strong> {chainId}</p>
            </div>
          ) : (
            <p>No wallet connected. Please connect your MetaMask wallet.</p>
          )}
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleConnectWallet} 
            disabled={isConnecting || !!walletAddress}
          >
            {isConnecting ? 'Connecting...' : walletAddress ? 'Connected' : 'Connect Wallet'}
          </Button>
        </CardFooter>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>EnhancedDonationPlatform Contract Details</CardDescription>
        </CardHeader>
        <CardContent>
          <p><strong>Contract Address:</strong> {contractAddress}</p>
          <p><strong>Network:</strong> Base Sepolia</p>
          <p>
            <a 
              href={`https://sepolia.basescan.org/address/${contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View on BaseScan
            </a>
          </p>
        </CardContent>
      </Card>

      <ContractInteraction />
    </div>
  );
}