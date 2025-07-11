"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Wallet, Zap, Download } from "lucide-react"
import {
  connectMetaMask,
  connectWeb3Auth,
  isMetaMaskInstalled,
  isWalletInstalled,
  getWeb3AuthUserInfo,
  type WalletInfo,
} from "@/lib/wallet-utils"

interface WalletConnectionProps {
  onSuccess: (walletInfo: WalletInfo, userInfo: any, connectionType: "social" | "wallet") => void
  onError: (error: string) => void
  isConnecting: boolean
  setIsConnecting: (connecting: boolean) => void
}

const SOCIAL_PROVIDERS = [
  {
    name: "Google",
    id: "google",
    icon: "🔍",
    description: "Continue with your Google account",
    color: "bg-red-50 hover:bg-red-100 border-red-200 dark:bg-red-950/20 dark:hover:bg-red-950/30 dark:border-red-800",
  },
  {
    name: "Facebook",
    id: "facebook",
    icon: "📘",
    description: "Continue with your Facebook account",
    color:
      "bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-800",
  },
  {
    name: "Twitter",
    id: "twitter",
    icon: "🐦",
    description: "Continue with your Twitter account",
    color: "bg-sky-50 hover:bg-sky-100 border-sky-200 dark:bg-sky-950/20 dark:hover:bg-sky-950/30 dark:border-sky-800",
  },
  {
    name: "Discord",
    id: "discord",
    icon: "🎮",
    description: "Continue with your Discord account",
    color:
      "bg-indigo-50 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/30 dark:border-indigo-800",
  },
  {
    name: "GitHub",
    id: "github",
    icon: "🐙",
    description: "Continue with your GitHub account",
    color:
      "bg-gray-50 hover:bg-gray-100 border-gray-200 dark:bg-gray-950/20 dark:hover:bg-gray-950/30 dark:border-gray-800",
  },
  {
    name: "Email",
    id: "email_passwordless",
    icon: "📧",
    description: "Continue with your email address",
    color:
      "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:border-emerald-800",
  },
]

export function WalletConnection({ onSuccess, onError, isConnecting, setIsConnecting }: WalletConnectionProps) {
  const [activeTab, setActiveTab] = useState<"social" | "wallet">("social")
  const [walletStatus, setWalletStatus] = useState({
    metamaskInstalled: false,
    walletInstalled: false,
  })

  useEffect(() => {
    setWalletStatus({
      metamaskInstalled: isMetaMaskInstalled(),
      walletInstalled: isWalletInstalled(),
    })
  }, [])

  const handleSocialLogin = async (providerId: string) => {
    setIsConnecting(true)
    onError("")

    try {
      const walletInfo = await connectWeb3Auth(providerId)
      const userInfo = await getWeb3AuthUserInfo()
      onSuccess(walletInfo, userInfo, "social")
    } catch (err: any) {
      onError(err.message || "Failed to connect with social login. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWeb3AuthModal = async () => {
    setIsConnecting(true)
    onError("")

    try {
      const walletInfo = await connectWeb3Auth()
      const userInfo = await getWeb3AuthUserInfo()
      onSuccess(walletInfo, userInfo, "social")
    } catch (err: any) {
      onError(err.message || "Failed to connect with Web3Auth. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleMetaMaskConnect = async () => {
    setIsConnecting(true)
    onError("")

    try {
      const walletInfo = await connectMetaMask()
      onSuccess(walletInfo, { walletType: "MetaMask", address: walletInfo.address }, "wallet")
    } catch (err: any) {
      onError(err.message || "Failed to connect MetaMask. Please make sure it's installed and unlocked.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleWalletConnectConnect = async () => {
    setIsConnecting(true)
    onError("")

    try {
      const walletInfo = await connectWeb3Auth("walletconnect")
      onSuccess(walletInfo, { walletType: "WalletConnect", address: walletInfo.address }, "wallet")
    } catch (err: any) {
      onError(err.message || "Failed to connect with WalletConnect. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Type Tabs */}
      <div className="flex items-center justify-center">
        <div className="flex bg-muted p-1 rounded-lg">
          <Button
            variant={activeTab === "social" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("social")}
            className="flex items-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Social Login</span>
          </Button>
          <Button
            variant={activeTab === "wallet" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("wallet")}
            className="flex items-center space-x-2"
          >
            <Wallet className="w-4 h-4" />
            <span>Wallet</span>
          </Button>
        </div>
      </div>

      {/* Social Login Options */}
      {activeTab === "social" && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">Sign in with Web3Auth</h3>
            <p className="text-sm text-muted-foreground">Choose your preferred social login method</p>
          </div>

          {/* Web3Auth Modal Button */}
          <Button
            variant="outline"
            className="w-full h-auto p-4 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:border-emerald-800"
            onClick={handleWeb3AuthModal}
            disabled={isConnecting}
          >
            <div className="flex items-center space-x-3 w-full">
              <Zap className="w-6 h-6 text-emerald-600" />
              <div className="text-left flex-1">
                <div className="font-medium">Web3Auth Modal</div>
                <div className="text-xs text-muted-foreground">Open Web3Auth login modal with all options</div>
              </div>
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {SOCIAL_PROVIDERS.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className={`justify-start h-auto p-4 ${provider.color} border`}
                onClick={() => handleSocialLogin(provider.id)}
                disabled={isConnecting}
              >
                <div className="flex items-center space-x-3 w-full">
                  <span className="text-2xl">{provider.icon}</span>
                  <div className="text-left flex-1">
                    <div className="font-medium">Continue with {provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Connection Options */}
      {activeTab === "wallet" && (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="font-medium mb-2">Connect Your Wallet</h3>
            <p className="text-sm text-muted-foreground">Connect using your preferred crypto wallet</p>
          </div>

          <div className="space-y-3">
            {/* MetaMask */}
            <Button
              variant="outline"
              className={`justify-start h-auto p-4 ${
                walletStatus.metamaskInstalled
                  ? "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:hover:bg-orange-950/30 dark:border-orange-800"
                  : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800 opacity-60"
              } border`}
              onClick={handleMetaMaskConnect}
              disabled={isConnecting || !walletStatus.metamaskInstalled}
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">🦊</span>
                <div className="text-left flex-1">
                  <div className="font-medium flex items-center space-x-2">
                    <span>MetaMask</span>
                    {walletStatus.metamaskInstalled && (
                      <Badge variant="secondary" className="text-xs">
                        Detected
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {walletStatus.metamaskInstalled
                      ? "Connect using MetaMask browser extension"
                      : "MetaMask not detected"}
                  </div>
                </div>
                {!walletStatus.metamaskInstalled && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open("https://metamask.io/download/", "_blank")
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Install
                  </Button>
                )}
              </div>
            </Button>

            {/* WalletConnect */}
            <Button
              variant="outline"
              className="justify-start h-auto p-4 bg-blue-50 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/20 dark:hover:bg-blue-950/30 dark:border-blue-800 border"
              onClick={handleWalletConnectConnect}
              disabled={isConnecting}
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">🔗</span>
                <div className="text-left flex-1">
                  <div className="font-medium">WalletConnect</div>
                  <div className="text-xs text-muted-foreground">Connect using WalletConnect protocol</div>
                </div>
              </div>
            </Button>

            {/* Other Wallets via Web3Auth */}
            <Button
              variant="outline"
              className="justify-start h-auto p-4 bg-emerald-50 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/30 dark:border-emerald-800 border"
              onClick={handleWeb3AuthModal}
              disabled={isConnecting}
            >
              <div className="flex items-center space-x-3 w-full">
                <span className="text-2xl">💼</span>
                <div className="text-left flex-1">
                  <div className="font-medium">Other Wallets</div>
                  <div className="text-xs text-muted-foreground">Coinbase, Trust Wallet, and more via Web3Auth</div>
                </div>
              </div>
            </Button>
          </div>

          {!walletStatus.walletInstalled && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">No wallet detected</p>
                  <p>
                    <a href="/wallet-setup" className="text-emerald-600 hover:underline">
                      Learn how to set up a crypto wallet
                    </a>{" "}
                    or use social login instead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Network Info */}
      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <Badge variant="outline" className="text-xs">
          SonicLabs Network
        </Badge>
        <span>•</span>
        <span>Secured by Web3Auth</span>
      </div>
    </div>
  )
}
