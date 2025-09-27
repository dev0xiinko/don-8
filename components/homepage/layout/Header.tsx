"use client"



import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/themes/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum && window.ethereum.selectedAddress) {
      setWalletAddress(window.ethereum.selectedAddress);
    }
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        setWalletAddress(accounts[0] || null);
      });
    }
    return () => {
      if (typeof window !== "undefined" && window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", () => {});
      }
    };
  }, []);

  const handleConnectWallet = async () => {
    setConnecting(true);
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setWalletAddress(accounts[0]);
        if (accounts[0]) {
          // Store wallet address for dashboard use
          window.localStorage.setItem("donor_wallet_address", accounts[0]);
          // Do NOT redirect here; only set wallet address
        }
      } catch (err) {
        // User rejected
      }
    } else {
      alert("MetaMask is not installed. Please install MetaMask and try again.");
    }
    setConnecting(false);
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D8</span>
          </div>
          <span className="text-xl font-bold">DON-8</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="https://ngo.don8.app" className="text-muted-foreground hover:text-foreground transition-colors">
            NGO
          </Link>
          <Link href="#campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
            Campaigns
          </Link>
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
        </nav>
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          {walletAddress ? (
            <>
              <Link href="/donor/dashboard">
                <Avatar className="w-9 h-9 cursor-pointer border-2 border-emerald-600 hover:border-emerald-700 transition">
                  <AvatarFallback>
                    {walletAddress.slice(0, 2).toUpperCase()}{walletAddress.slice(-2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  window.localStorage.removeItem("donor_wallet_address");
                  setWalletAddress(null);
                  if (typeof window !== "undefined" && window.ethereum && window.ethereum.selectedAddress) {
                    // MetaMask: force disconnect by switching to an empty account if possible
                    // (MetaMask does not support programmatic disconnect, so just clear state)
                  }
                  router.push("/");
                }}
              >
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnectWallet} className="bg-emerald-600 hover:bg-emerald-700" disabled={connecting}>
              {connecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}