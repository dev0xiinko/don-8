'use client';

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletProvider';
import { useContract } from '@/hooks/useContract';
import { ethers } from 'ethers';

export default function ContractInteraction() {
  const { walletInfo } = useWallet();
  const { contract, isLoading, error, switchToSupportedNetwork, isNetworkSupported } = useContract();
  
  const [ngoAddress, setNgoAddress] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [txStatus, setTxStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contract) {
      setTxStatus('Contract not available');
      return;
    }
    
    try {
      setTxStatus('Processing...');
      
      const tx = await contract.donateETH(
        ngoAddress,
        isAnonymous,
        donationAmount
      );
      
      setTxHash(tx.hash);
      setTxStatus('Transaction submitted');
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      setTxStatus('Transaction confirmed!');
    } catch (err: any) {
      console.error('Donation error:', err);
      setTxStatus(`Error: ${err.message || 'Transaction failed'}`);
    }
  };
  
  if (!walletInfo) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-center">Please connect your wallet to interact with the contract</p>
      </div>
    );
  }
  
  if (walletInfo.walletType !== 'metamask') {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-center">Please connect with MetaMask to interact with the contract</p>
      </div>
    );
  }
  
  if (!isNetworkSupported) {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <p className="text-center mb-4">Please switch to Base Sepolia network</p>
        <button 
          onClick={switchToSupportedNetwork}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Switch to Base Sepolia
        </button>
      </div>
    );
  }
  
  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h2 className="text-xl font-bold mb-4">Donate to NGO</h2>
      
      {isLoading ? (
        <p className="text-center">Loading contract...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <form onSubmit={handleDonate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NGO Address
            </label>
            <input
              type="text"
              value={ngoAddress}
              onChange={(e) => setNgoAddress(e.target.value)}
              placeholder="0x..."
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (ETH)
            </label>
            <input
              type="text"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              placeholder="0.01"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="anonymous" className="text-sm font-medium text-gray-700">
              Make donation anonymous
            </label>
          </div>
          
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Donate
          </button>
        </form>
      )}
      
      {txStatus && (
        <div className="mt-4 p-3 border rounded bg-gray-100">
          <p className="font-medium">Status: {txStatus}</p>
          {txHash && (
            <p className="text-sm mt-2">
              Transaction: 
              <a 
                href={`https://sepolia.basescan.org/tx/${txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                View on BaseScan
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}