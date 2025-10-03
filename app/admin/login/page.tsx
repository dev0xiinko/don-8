"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Eye, EyeOff, Wallet, Loader2 } from "lucide-react"
import { connectWallet, shortenAddress } from "@/lib/metamask"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [walletLoading, setWalletLoading] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      console.log('Login response:', { status: response.status, data })

      if (response.ok) {
        console.log('✅ Login successful, storing session and redirecting...')
        
        // Store admin session
        const adminSession = {
          id: data.admin.id,
          email: data.admin.email,
          role: "admin",
          token: data.token,
          loginTime: new Date().toISOString(),
        }

        localStorage.setItem("admin_session", JSON.stringify(adminSession))
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400` // 24 hours
        
        console.log('Session stored, redirecting to dashboard...')
        router.push("/admin/dashboard")
      } else {
        console.log('❌ Login failed:', data)
        setError(data.error || "Invalid credentials. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWalletConnect = async () => {
    setWalletLoading(true)
    setError("")

    try {
      const address = await connectWallet()
      if (!address) {
        setError("Failed to connect wallet. Please try again.")
        return
      }

      setWalletAddress(address)

      // Authenticate with backend using wallet address
      const response = await fetch('/api/admin/wallet-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress: address }),
      })

      const data = await response.json()

      if (response.ok) {
        const adminSession = {
          id: data.admin.id,
          walletAddress: address,
          role: "admin",
          token: data.token,
          loginTime: new Date().toISOString(),
          authType: "wallet",
        }

        localStorage.setItem("admin_session", JSON.stringify(adminSession))
        document.cookie = `admin_token=${data.token}; path=/; max-age=86400`

        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Wallet address not authorized for admin access.")
      }
    } catch (error) {
      setError("Failed to authenticate with wallet. Please try again.")
    } finally {
      setWalletLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Shield className="text-white w-6 h-6" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the DON-8 admin panel</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Administrator Access</CardTitle>
            <CardDescription>Choose your preferred authentication method</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="credentials" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="credentials">Admin Credentials</TabsTrigger>
                <TabsTrigger value="wallet">Wallet Connect</TabsTrigger>
              </TabsList>

              <TabsContent value="credentials" className="space-y-6 mt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@don8.app"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative mt-1">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="wallet" className="space-y-4 mt-6">
                <div className="space-y-4">
                  {!walletAddress ? (
                    <Button
                      variant="outline"
                      className="w-full justify-center h-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white border-none hover:from-purple-600 hover:to-blue-600"
                      onClick={handleWalletConnect}
                      disabled={walletLoading}
                    >
                      {walletLoading ? (
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                      ) : (
                        <Wallet className="w-5 h-5 mr-3" />
                      )}
                      {walletLoading ? "Connecting..." : "Connect Wallet"}
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-green-800">
                            <p className="font-medium">Wallet Connected</p>
                            <p className="text-xs mt-1">{shortenAddress(walletAddress)}</p>
                          </div>
                          <Wallet className="w-5 h-5 text-green-600" />
                        </div>
                      </div>
                      <Button
                        className="w-full h-12"
                        onClick={handleWalletConnect}
                        disabled={walletLoading}
                      >
                        {walletLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Authenticating...
                          </>
                        ) : (
                          "Authenticate as Admin"
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Admin Wallet Authentication</p>
                    <p>Connect your authorized admin wallet to access the dashboard. Only pre-approved wallet addresses can access admin functions.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">This is a secure admin area. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  )
}
