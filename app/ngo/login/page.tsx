"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building2, Lock, Mail, Eye, EyeOff, AlertCircle, CheckCircle2, Heart, Shield, Users, TrendingUp
} from "lucide-react"

export default function NGOLoginPage() {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleLogin = async () => {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch('/api/ngo/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true)
        setError("")
        
        // Store login state and NGO info
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ngo_logged_in', 'true')
          sessionStorage.setItem('ngo_info', JSON.stringify(result.ngo))
        }
        
        // Redirect to management page
        setTimeout(() => {
          window.location.href = '/ngo/management'
        }, 1000)
      } else {
        setError(result.message || "Login failed. Please try again.")
        setSuccess(false)
      }
    } catch (error) {
      setError("Network error. Please check your connection and try again.")
      setSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }





  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && formData.email && formData.password) {
      handleLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-2xl">
                <Building2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">NGO Portal</h1>
                <p className="text-gray-600">Transparent Relief Fund Management</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 mt-8">
            <div className="flex items-start space-x-4 bg-white p-4 rounded-xl shadow-sm border">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Heart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Manage Campaigns</h3>
                <p className="text-sm text-gray-600">Create and track relief campaigns in real-time</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white p-4 rounded-xl shadow-sm border">
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Blockchain Verified</h3>
                <p className="text-sm text-gray-600">All donations tracked on-chain for transparency</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white p-4 rounded-xl shadow-sm border">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Donor Insights</h3>
                <p className="text-sm text-gray-600">Track donor engagement and campaign analytics</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 bg-white p-4 rounded-xl shadow-sm border">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-Time Updates</h3>
                <p className="text-sm text-gray-600">Instant notifications and progress tracking</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl text-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm opacity-90">Total Donations</div>
                <div className="text-3xl font-bold">2.4M+ SONIC</div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Active Campaigns</div>
                <div className="text-3xl font-bold">42</div>
              </div>
            </div>
            <div className="text-xs opacity-75">Trusted by 150+ NGOs worldwide</div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-3 pb-6">
              <div className="flex justify-center lg:hidden mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-green-600 p-3 rounded-2xl">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">NGO Login</CardTitle>
              <CardDescription className="text-center">
                Sign in to access your organization's dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@organization.org"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onKeyPress={handleKeyPress}
                      className="pl-10 pr-10 h-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember & Forgot */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-gray-600">Remember me</span>
                  </label>
                  <button className="text-blue-600 hover:text-blue-700 font-medium">
                    Forgot password?
                  </button>
                </div>

                {/* Error Alert */}
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {success && (
                  <Alert className="border-green-200 bg-green-50 text-green-800 animate-in fade-in">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Login successful! Redirecting...</AlertDescription>
                  </Alert>
                )}

                {/* Login Button */}
                <Button
                  type="button"
                  onClick={handleLogin}
                  className="w-full h-11 text-base"
                  disabled={isLoading || success || !formData.email || !formData.password}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Success!
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
                

              </div>

           
              {/* Register Link */}
              <div className="mt-6 text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  Register your NGO
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Security Note */}
          <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center space-x-1">
            <Shield className="w-3 h-3" />
            <span>Secured with blockchain verification</span>
          </div>
        </div>
      </div>
    </div>
  )
}