"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DonorDashboard() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const router = useRouter();

  // Sync wallet address from MetaMask if available
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const updateWallet = () => {
        const addr = window.ethereum.selectedAddress;
        if (addr) {
          window.localStorage.setItem("donor_wallet_address", addr);
          setWalletAddress(addr);
        } else {
          window.localStorage.removeItem("donor_wallet_address");
          setWalletAddress(null);
          router.push("/login");
        }
      };
      updateWallet();
      window.ethereum.on("accountsChanged", updateWallet);
      return () => {
        window.ethereum.removeListener("accountsChanged", updateWallet);
      };
    } else {
      // fallback to localStorage if no ethereum
      const addr =
        typeof window !== "undefined"
          ? window.localStorage.getItem("donor_wallet_address")
          : null;
      if (!addr) {
        router.push("/login");
      } else {
        setWalletAddress(addr);
      }
    }
  }, [router]);

  if (!walletAddress) return null;

  // --- Minimal dashboard for wallet-connected donor ---
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold">DON-8 Donor Dashboard</span>
            <span className="ml-6 text-xs text-muted-foreground">
              Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            </span>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Welcome, Donor!</h1>
        <p className="mb-2">Your connected wallet address:</p>
        <div className="p-4 bg-emerald-50 rounded-lg font-mono text-sm">
          {walletAddress}
        </div>
        {/* Add more donor dashboard content here */}
      </main>
    </div>
  );
}
