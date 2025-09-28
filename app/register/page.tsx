"use client"

import type React from "react"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Shield, Users, Building, Mail, Lock, Eye, EyeOff, User } from "lucide-react"
import { SocialLogin } from "@/components/auth/SocialLogin"

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const userType = searchParams.get("type") || "donor"

  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    userType: userType,
    name: "",
    email: "",
    password: "",
    organization: "",
    description: "",
    website: "",
    category: "",
    agreeTerms: false,
  })

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate registration - redirect to appropriate dashboard
    if (formData.userType === "donor") {
      window.location.href = "/donor/dashboard"
    } else {
      window.location.href = "/ngo/dashboard"
    }
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4">
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
            <h1 className="text-3xl font-bold mb-2">Join DON-8</h1>
            <p className="text-muted-foreground">Create your account and start making a difference</p>
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
            <div className="flex justify-center space-x-3 mb-8">
              <Button
                variant={formData.userType === "donor" ? "default" : "outline"}
                onClick={() => handleInputChange("userType", "donor")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  formData.userType === "donor" 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" 
                    : "border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Donor</span>
              </Button>
              <Button
                variant={formData.userType === "ngo" ? "default" : "outline"}
                onClick={() => handleInputChange("userType", "ngo")}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  formData.userType === "ngo" 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md" 
                    : "border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50"
                }`}
              >
                <Building className="w-4 h-4" />
                <span>NGO</span>
              </Button>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-3">
              {formData.userType === "donor" ? "Donor Registration" : "NGO Registration"}
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              {formData.userType === "donor" 
                ? "Join our community of donors and start making a difference" 
                : "Register your organization and connect with donors worldwide"
              }
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    {formData.userType === "donor" ? "Full Name" : "Organization Name"}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder={formData.userType === "donor" ? "John Doe" : "Your Organization"}
                      className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="email@example.com"
                      className="pl-10 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="Create a strong password"
                    className="pl-10 pr-12 h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-12 px-3 py-2 hover:bg-transparent text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {formData.userType === "ngo" && (
                <>
                  <div className="space-y-3">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">
                      Organization Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Describe your organization's mission and activities..."
                      rows={4}
                      className="border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 resize-none"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="website" className="text-sm font-semibold text-gray-700">
                        Website <span className="text-gray-400 font-normal">(Optional)</span>
                      </Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://yourorganization.org"
                        className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                        Category
                      </Label>
                      <Select onValueChange={(value) => handleInputChange("category", value)}>
                        <SelectTrigger className="h-12 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="education">Education</SelectItem>
                          <SelectItem value="healthcare">Healthcare</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="poverty">Poverty Alleviation</SelectItem>
                          <SelectItem value="disaster">Disaster Relief</SelectItem>
                          <SelectItem value="human-rights">Human Rights</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 underline font-medium">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={!formData.agreeTerms}
              >
                <Shield className="w-5 h-5 mr-2" />
                Create Account
              </Button>
            </form>

            {/* Social Login for NGOs - Professional placement at bottom */}
            {formData.userType === "ngo" && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-500 font-medium">Or continue with</p>
                </div>
                <div className="space-y-3">
                  <SocialLogin userType="ngo" />
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>Secure Registration</span>
            </div>
            <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
            <span>Blockchain Platform</span>
          </div>
        </div>
      </div>
    </div>
  )
}
