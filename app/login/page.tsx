"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Shield, AlertCircle, CheckCircle, Loader2, Zap } from "lucide-react"
import { useWeb3Auth } from "@/context/Web3AuthProvider"

export default function LoginPage() {
  const router = useRouter()
  const { isLoading, isConnected, userInfo, walletInfo, login } = useWeb3Auth()
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // If already connected, redirect to dashboard
    if (isConnected && userInfo) {
      setTimeout(() => {
        router.push("/donor/dashboard")
      }, 2000)
    }
  }, [isConnected, userInfo, router])

  const handleLogin = async () => {
    try {
      setConnecting(true)
      setError("")
      await login()
    } catch (error: any) {
      console.error("Login error:", error)
      setError(error.message || "Failed to connect. Please try again.")
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
            <span>Initializing Web3Auth...</span>
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
                <span>Successfully Connected!</span>
              </CardTitle>
              <CardDescription>Welcome to DON-8 platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* User Info */}
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {userInfo.profileImage && (
                      <img
                        src={userInfo.profileImage || "/placeholder.svg"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{userInfo.name || "Web3 User"}</p>
                      <p className="text-sm text-muted-foreground">{userInfo.email}</p>
                      {userInfo.typeOfLogin && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {userInfo.typeOfLogin}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Wallet Info */}
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
                        <p className="font-medium">{Number(walletInfo.balance).toFixed(4)} ETH</p>
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
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold mb-2">Welcome to DON-8</h1>
            <p className="text-muted-foreground">Connect Wallet to get started.</p>
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Don-8 Login</span>
            </CardTitle>
            <CardDescription>Secure authentication with social login or wallet</CardDescription>
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
                  <p className="text-sm text-muted-foreground">Connecting with Web3Auth...</p>
                  <p className="text-xs text-muted-foreground mt-2">This may take a few seconds</p>
                </div>
              </div>
            )}

            {/* Login Button */}
            {!connecting && (
              <div className="space-y-4">
                <Button
                  onClick={handleLogin}
                  className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-lg"
                  disabled={connecting}
                >
                  <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6" />
                    <div className="text-left">
                      <div className="font-medium">Connect Wallet</div>
                      <div className="text-xs opacity-90">Create your account</div>
                    </div>
                  </div>
                </Button>

                {/* Features */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 text-center">Web3Auth Features</h4>
                  <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Social login (Google, Facebook, Twitter, etc.)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Automatic wallet creation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Non-custodial and secure</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Multi-factor authentication</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 space-y-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Powered by Web3Auth</span>
              </div>
              <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
              <Badge variant="outline" className="text-xs">
                Ethereum Network
              </Badge>
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-muted-foreground text-sm">
              New to Web3?{" "}
              <Link href="/wallet-setup" className="text-emerald-600 hover:underline font-medium">
                Learn about wallets
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
