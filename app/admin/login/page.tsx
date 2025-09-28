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
import { Shield, Eye, EyeOff, Chrome, Github, Twitter, Loader2 } from "lucide-react"

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [socialLoading, setSocialLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock authentication - in real app, this would be a proper API call
      if (email === "admin@don8.app" && password === "admin123") {
        const adminSession = {
          id: "admin_001",
          email: email,
          role: "admin",
          loginTime: new Date().toISOString(),
        }

        // Store session in both localStorage and cookie
        localStorage.setItem("admin_session", JSON.stringify(adminSession))
        document.cookie = `admin_session=${JSON.stringify(adminSession)}; path=/; max-age=86400` // 24 hours

        router.push("/admin/dashboard")
      } else {
        setError("Invalid email or password. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during login. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialProvider = async (provider: "google" | "github" | "twitter") => {
    setSocialLoading(true)
    setError("")

    try {
      // Simulate OAuth flow
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock admin authentication via social provider
      const adminSession = {
        id: `admin_${provider}_001`,
        email: `admin@${provider}.com`,
        role: "admin",
        loginTime: new Date().toISOString(),
        authType: provider,
      }

      localStorage.setItem("admin_session", JSON.stringify(adminSession))
      document.cookie = `admin_session=${JSON.stringify(adminSession)}; path=/; max-age=86400`

      router.push("/admin/dashboard")
    } catch (error) {
      setError(`Failed to login with ${provider}. Please try again.`)
    } finally {
      setSocialLoading(false)
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
                <TabsTrigger value="social">Social Login</TabsTrigger>
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

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div>
                      <strong>Email:</strong> admin@don8.app
                    </div>
                    <div>
                      <strong>Password:</strong> admin123
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-transparent"
                    onClick={() => handleSocialProvider("google")}
                    disabled={socialLoading}
                  >
                    {socialLoading ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Chrome className="w-5 h-5 mr-3" />
                    )}
                    Continue with Google
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-transparent"
                    onClick={() => handleSocialProvider("github")}
                    disabled={socialLoading}
                  >
                    {socialLoading ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Github className="w-5 h-5 mr-3" />
                    )}
                    Continue with GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12 bg-transparent"
                    onClick={() => handleSocialProvider("twitter")}
                    disabled={socialLoading}
                  >
                    {socialLoading ? (
                      <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    ) : (
                      <Twitter className="w-5 h-5 mr-3" />
                    )}
                    Continue with Twitter
                  </Button>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Admin Social Login</p>
                    <p>Social login for admin accounts requires additional verification and approval.</p>
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
