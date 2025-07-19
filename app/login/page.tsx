"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Wallet, AlertCircle, CheckCircle, Loader2, Download } from "lucide-react"
import { useWallet } from "@/contexts/WalletProvider"
import { isMetaMaskInstalled, isPhantomInstalled } from "@/lib/wallet-utils"

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, isConnected, walletInfo, userInfo, connectWallet } = useWallet()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")
  const [walletStatus, setWalletStatus] = useState({
    metamaskInstalled: false,
    phantomInstalled: false,
  })

  useEffect(() => {
    setWalletStatus({
      metamaskInstalled: isMetaMaskInstalled(),
      phantomInstalled: isPhantomInstalled(),
    })
  }, [])

  useEffect(() => {
    // If already connected, redirect to dashboard
    if (isConnected && userInfo) {
      setTimeout(() => {
        router.push("/donor/dashboard")
      }, 2000)
    }
  }, [isConnected, userInfo, router])

  const handleWalletConnect = async (walletType: "metamask" | "phantom") => {
    try {
      setConnecting(true)
      setError("")
      await connectWallet(walletType)
    } catch (error: any) {
      console.error("Wallet connection error:", error)
      setError(error.message || "Failed to connect wallet. Please try again.")
    } finally {
      setConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">D8</span>
            </div>
            <span className="text-2xl font-bold">DON-8</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Checking wallet connection...</span>
          </div>
        </div>
      </div>
    )
  }

  if (isConnected && userInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">D8</span>
                </div>
                <span className="text-2xl font-bold">DON-8</span>
              </div>
              <CardTitle className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>Wallet Connected!</span>
              </CardTitle>
              <CardDescription>Welcome to DON-8 platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Wallet Info */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{userInfo.walletType} Wallet</p>
                      <p className="text-sm text-muted-foreground">{userInfo.network}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {userInfo.address.substring(0, 6)}...{userInfo.address.substring(38)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Balance Info */}
                {walletInfo && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                    <h4 className="font-medium mb-2">Wallet Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Address:</span>
                        <p className="font-mono text-xs break-all">{walletInfo.address}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Balance:</span>
                        <p className="font-medium">
                          {Number(walletInfo.balance).toFixed(4)} {walletInfo.walletType === "metamask" ? "ETH" : "SOL"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Network:</span>
                        <p className="font-medium">{walletInfo.network}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Redirect Message */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Redirecting to dashboard...</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D8</span>
              </div>
              <span className="text-2xl font-bold">DON-8</span>
            </div>
            <h1 className="text-3xl font-bold mb-2">Connect Your Wallet</h1>
            <p className="text-muted-foreground">Choose your preferred wallet to get started</p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Wallet className="w-5 h-5" />
              <span>Wallet Authentication</span>
            </CardTitle>
            <CardDescription>Connect with MetaMask or Phantom wallet</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {connecting && (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-600" />
                  <p className="text-sm text-muted-foreground">Connecting to wallet...</p>
                  <p className="text-xs text-muted-foreground mt-2">Please check your wallet for connection request</p>
                </div>
              </div>
            )}

            {/* Wallet Options */}
            {!connecting && (
              <div className="space-y-4">
                {/* MetaMask */}
                <Button
                  variant="outline"
                  className={`justify-start h-auto p-4 w-full ${
                    walletStatus.metamaskInstalled
                      ? "bg-orange-50 hover:bg-orange-100 border-orange-200 dark:bg-orange-950/20 dark:hover:bg-orange-950/30 dark:border-orange-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800 opacity-60"
                  } border`}
                  onClick={() => handleWalletConnect("metamask")}
                  disabled={connecting || !walletStatus.metamaskInstalled}
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

                {/* Phantom */}
                <Button
                  variant="outline"
                  className={`justify-start h-auto p-4 w-full ${
                    walletStatus.phantomInstalled
                      ? "bg-purple-50 hover:bg-purple-100 border-purple-200 dark:bg-purple-950/20 dark:hover:bg-purple-950/30 dark:border-purple-800"
                      : "bg-gray-50 border-gray-200 dark:bg-gray-950/20 dark:border-gray-800 opacity-60"
                  } border`}
                  onClick={() => handleWalletConnect("phantom")}
                  disabled={connecting || !walletStatus.phantomInstalled}
                >
                  <div className="flex items-center space-x-3 w-full">
                    <span className="text-2xl">👻</span>
                    <div className="text-left flex-1">
                      <div className="font-medium flex items-center space-x-2">
                        <span>Phantom</span>
                        {walletStatus.phantomInstalled && (
                          <Badge variant="secondary" className="text-xs">
                            Detected
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {walletStatus.phantomInstalled ? "Connect using Phantom wallet" : "Phantom not detected"}
                      </div>
                    </div>
                    {!walletStatus.phantomInstalled && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          window.open("https://phantom.app/", "_blank")
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Install
                      </Button>
                    )}
                  </div>
                </Button>

                {/* No Wallets Detected */}
                {!walletStatus.metamaskInstalled && !walletStatus.phantomInstalled && (
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium mb-1">No wallets detected</p>
                        <p>
                          Please install{" "}
                          <a
                            href="https://metamask.io/download/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            MetaMask
                          </a>{" "}
                          or{" "}
                          <a
                            href="https://phantom.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:underline"
                          >
                            Phantom
                          </a>{" "}
                          to continue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Wallet className="w-4 h-4" />
                <span>Secure Wallet Connection</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <span>Non-custodial</span>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              New to crypto wallets?{" "}
              <Link href="/wallet-setup" className="text-emerald-600 hover:underline font-medium">
                Learn how to set up a wallet
              </Link>
            </p>
            <p className="text-muted-foreground text-sm">
              Don't have an account?{" "}
              <Link href="/register" className="text-emerald-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
