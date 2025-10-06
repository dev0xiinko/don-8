"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/themes/theme-toggle"
import HealthStatus from "@/components/health-status"
import { Search, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import dynamic from "next/dynamic"

const InstallMetaMaskDemo = dynamic(() => import("@/components/features/wallet/InstallMetaMaskDemo"), { ssr: false })

export function Header() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
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

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById('search-container');
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

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

  // Search functionality
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch('/api/campaigns');
      const result = await response.json();
      
      if (result.success) {
        const filtered = result.campaigns.filter((campaign: any) =>
          campaign.title?.toLowerCase().includes(query.toLowerCase()) ||
          campaign.description?.toLowerCase().includes(query.toLowerCase()) ||
          campaign.ngoName?.toLowerCase().includes(query.toLowerCase()) ||
          campaign.category?.toLowerCase().includes(query.toLowerCase()) ||
          campaign.location?.toLowerCase().includes(query.toLowerCase())
        );
        
        setSearchResults(filtered.slice(0, 5)); // Show max 5 results
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCampaignSelect = (campaignId: string) => {
    setShowResults(false);
    setSearchQuery("");
    router.push(`/campaign/${campaignId}`);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
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
          <Link href="/ngo/login" className="text-muted-foreground hover:text-foreground transition-colors">
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

        {/* Search Section */}
        <div id="search-container" className="relative flex-1 max-w-md mx-4 hidden lg:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search campaigns, NGOs, categories..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-10 w-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showResults && (
            <Card className="absolute top-full mt-1 w-full z-50 shadow-lg">
              <CardContent className="p-0">
                {isSearching ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    Searching campaigns...
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No campaigns found for "{searchQuery}"
                  </div>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    {searchResults.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        onClick={() => handleCampaignSelect(campaign.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {campaign.title || 'Untitled Campaign'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              by {campaign.ngoName} • {campaign.category}
                            </div>
                            <div className="text-xs text-emerald-600 mt-1">
                              {campaign.raisedAmount || 0} SONIC raised of {campaign.targetAmount} SONIC
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {campaign.location}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <HealthStatus className="hidden sm:flex" showDetails={false} />
          <ThemeToggle />
          {typeof window !== "undefined" && !window.ethereum ? (
            <div className="ml-2">
              <InstallMetaMaskDemo />
            </div>
          ) : walletAddress ? (
            <>
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Avatar className="w-9 h-9 cursor-pointer border-2 border-emerald-600 hover:border-emerald-700 transition">
                    <AvatarFallback>
                      {walletAddress.slice(0, 2).toUpperCase()}{walletAddress.slice(-2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
              </div>
              <span className="text-xs text-muted-foreground truncate max-w-[120px]">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => {
                  window.localStorage.removeItem("donor_wallet_address");
                  setWalletAddress(null);
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