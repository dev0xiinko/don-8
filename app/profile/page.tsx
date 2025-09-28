"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/WalletProvider"
import { useProfile } from "@/contexts/ProfileProvider"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ProfilePage() {
  const { walletInfo, isConnected, connectWallet, disconnect, isLoading } = useWallet() || { 
    walletInfo: null, 
    isConnected: false,
    connectWallet: async () => {},
    disconnect: async () => {},
    isLoading: false
  }
  const { userName, profileImage, setUserName, setProfileImage, saveProfile: saveProfileData } = useProfile()
  const [isEditing, setIsEditing] = useState(false)
  const [connectError, setConnectError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Set username from wallet if connected and no username is set
  useEffect(() => {
    // If wallet is connected, use wallet address as username if no username is set
    if (isConnected && walletInfo?.address && !userName) {
      setUserName(`Donor ${formatAddress(walletInfo.address)}`)
      saveProfileData()
    }
  }, [isConnected, walletInfo, userName])
  
  // Mock donation history data
  const donationHistory = [
    { id: 1, amount: "5 eth", campaign: "Clean Water Initiative", ngo: "Water For All" },
    { id: 2, amount: "2 eth", campaign: "Education For Children", ngo: "Global Education Fund" },
  ]

  // Format wallet address for display
  const formatAddress = (address: string) => {
    if (!address) return "0x..."
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }
  
  // Handle profile image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setProfileImage(result)
        saveProfileData() // Save to context which persists to localStorage
      }
      reader.readAsDataURL(file)
    }
  }
  
  // Save profile data
  const saveProfile = () => {
    saveProfileData() // Save to context which persists to localStorage
    setIsEditing(false)
  }
  
  // Handle wallet connection
  const handleConnectWallet = async (type: "metamask" | "phantom") => {
    try {
      setConnectError(null)
      await connectWallet(type)
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      setConnectError(error instanceof Error ? error.message : "Failed to connect wallet")
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Donor Profile</h1>
      
      {connectError && (
        <Alert className="mb-4 border-red-500 bg-red-50 dark:bg-red-900/20">
          <AlertDescription className="text-red-600 dark:text-red-400">
            {connectError}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 mb-8">
        <div className="flex flex-col items-center justify-center">
          {isEditing ? (
            <div className="mb-6 text-center">
              <div className="relative inline-block">
                <Avatar className="h-32 w-32 mb-2 bg-gray-300 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  {profileImage ? (
                    <AvatarImage src={profileImage} alt="Profile" />
                  ) : (
                    <AvatarFallback>
                      <span className="text-2xl">{walletInfo?.address ? formatAddress(walletInfo.address).substring(0, 2) : "0x"}</span>
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="absolute bottom-0 right-0">
                  <Button size="sm" variant="secondary" className="rounded-full h-8 w-8 p-0" onClick={() => fileInputRef.current?.click()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </Button>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Click to upload profile picture</p>
            </div>
          ) : (
            <Avatar className="h-32 w-32 mb-4 bg-gray-300">
              {profileImage ? (
                <AvatarImage src={profileImage} alt="Profile" />
              ) : (
                <AvatarFallback>
                  <span className="text-2xl">{walletInfo?.address ? formatAddress(walletInfo.address).substring(0, 2) : "0x"}</span>
                </AvatarFallback>
              )}
            </Avatar>
          )}
          
          <div className="text-center mb-4 w-full max-w-xs">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name" 
                    value={userName} 
                    onChange={(e) => setUserName(e.target.value)} 
                    placeholder="Enter your name" 
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <>
                {userName && <p className="text-xl font-bold mb-2">{userName}</p>}
                <div className="mt-2">
                  <p className="text-sm font-medium">Wallet ID:</p>
                  <p className="text-base font-mono break-all">{walletInfo?.address || "Not connected"}</p>
                  {walletInfo?.network && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {walletInfo.network}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          
          {!isConnected ? (
            <div className="space-y-3 w-full max-w-xs">
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                Connect your wallet to automatically update your profile
              </p>
              <Button 
                className="w-full" 
                onClick={() => handleConnectWallet("metamask")}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect MetaMask"}
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleConnectWallet("phantom")}
                disabled={isLoading}
              >
                {isLoading ? "Connecting..." : "Connect Phantom"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 w-full max-w-xs">
              {isEditing ? (
                <div className="flex gap-2 justify-center">
                  <Button onClick={saveProfile}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              ) : (
                <div className="flex gap-2 flex-col">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsEditing(true)}
                  >
                    Edit profile
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={disconnect}
                  >
                    Disconnect Wallet
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>History of Donations</CardTitle>
        </CardHeader>
        <CardContent>
          {donationHistory.length > 0 ? (
            <div className="space-y-4">
              {donationHistory.map((donation) => (
                <div 
                  key={donation.id} 
                  className="p-4 border rounded-lg dark:border-gray-700"
                >
                  <p className="mb-2">
                    <span className="text-gray-500 dark:text-gray-400">{formatAddress(walletInfo?.address || "")}</span> donated <span className="font-medium">{donation.amount}</span> to <span className="font-medium">{donation.campaign}</span> by <span className="font-medium">{donation.ngo}</span>
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No donation history found
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}