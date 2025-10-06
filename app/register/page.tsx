"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Shield, Eye, EyeOff, Check, X } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [applicationId, setApplicationId] = useState<number | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string>("");
  const [devVerificationCode, setDevVerificationCode] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [walletError, setWalletError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    userType: "ngo",
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    description: "",
    website: "",
    category: "",
    agreeTerms: false,
    registrationNumber: "",
    foundedYear: "",
    teamSize: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    walletAddress: "",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear password errors when user types
    if (field === 'password' || field === 'confirmPassword') {
      setPasswordError("");
    }
  };

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    if (checks.length) score++;
    if (checks.uppercase) score++;
    if (checks.lowercase) score++;
    if (checks.number) score++;
    if (checks.special) score++;

    if (score <= 2) return { strength: 'weak', color: 'text-red-500', bgColor: 'bg-red-100', score, checks };
    if (score <= 4) return { strength: 'medium', color: 'text-yellow-600', bgColor: 'bg-yellow-100', score, checks };
    return { strength: 'strong', color: 'text-green-600', bgColor: 'bg-green-100', score, checks };
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleConnectWallet = async () => {
    setWalletError("");
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        if (accounts && accounts[0]) {
          setFormData((prev) => ({ ...prev, walletAddress: accounts[0] }));
        }
      } catch (err) {
        setWalletError("Failed to connect wallet. Please try again.");
      }
    } else {
      setWalletError(
        "MetaMask is not installed. Please install MetaMask and try again."
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    // Password validation
    if (formData.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (passwordStrength.strength === 'weak') {
      setPasswordError("Password is too weak. Please include uppercase, lowercase, numbers, and special characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    // Basic validation
    if (!formData.name || !formData.email || !formData.description || !formData.category) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!formData.agreeTerms) {
      alert("Please agree to the terms and conditions.");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting NGO application:", formData);
      
      const response = await fetch("/api/ngo-application/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          description: formData.description,
          website: formData.website,
          category: formData.category,
          agreeTerms: formData.agreeTerms,
          registrationNumber: formData.registrationNumber,
          foundedYear: formData.foundedYear,
          teamSize: formData.teamSize,
          twitter: formData.twitter,
          facebook: formData.facebook,
          linkedin: formData.linkedin,
          walletAddress: formData.walletAddress
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit application");
      }

      console.log("Application submitted successfully:", result);
      
      setApplicationId(result.applicationId);
      // Capture dev-only code for local testing (no real email provider)
      if (result.devOnlyVerificationCode) {
        setDevVerificationCode(result.devOnlyVerificationCode);
      }
      // Store in sessionStorage for confirmation page and verification step
      sessionStorage.setItem("ngoProfile", JSON.stringify({
        ...formData,
        applicationId: result.applicationId
      }));
      setSubmitted(true);
    } catch (err: any) {
      console.error("Application submission error:", err);
      alert(`Failed to submit application: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (!applicationId) return;
    setVerifying(true);
    setVerifyMessage("");
    try {
      const res = await fetch('/api/ngo-application/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'send' })
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMessage('Verification code sent to your email.');
        if (data.devOnlyVerificationCode) {
          setDevVerificationCode(data.devOnlyVerificationCode);
        }
      } else {
        setVerifyMessage(data.message || 'Failed to send verification code.');
      }
    } catch (e: any) {
      setVerifyMessage('Failed to send verification code.');
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!applicationId || !verifyCode) return;
    setVerifying(true);
    setVerifyMessage("");
    try {
      const res = await fetch('/api/ngo-application/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, action: 'verify', code: verifyCode })
      });
      const data = await res.json();
      if (data.success) {
        setVerifyMessage('Email verified! You can now sign in after admin approval.');
      } else {
        setVerifyMessage(data.message || 'Invalid or expired code.');
      }
    } catch (e: any) {
      setVerifyMessage('Verification failed.');
    } finally {
      setVerifying(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="max-w-lg w-full text-center shadow-xl border-0">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-emerald-700">
              Application Submitted
            </CardTitle>
            <CardDescription className="text-gray-600">
              We sent a 6-digit verification code to your email. Enter it below to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devVerificationCode && (
                <div className="p-3 rounded-md bg-yellow-50 text-yellow-800 text-sm text-left">
                  <div className="font-medium">Development only</div>
                  <div>Your verification code: <span className="font-mono">{devVerificationCode}</span></div>
                  <div className="text-xs mt-1">This is shown because no email provider is configured. Hide this in production.</div>
                </div>
              )}
              <div className="text-left">
                <Label htmlFor="verifyCode">Verification Code</Label>
                <Input id="verifyCode" value={verifyCode} onChange={(e) => setVerifyCode(e.target.value)} placeholder="Enter 6-digit code" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleVerifyCode} disabled={verifying || verifyCode.length < 6} className="bg-emerald-600 text-white hover:bg-emerald-700 w-full">
                  {verifying ? 'Verifying...' : 'Verify Email'}
                </Button>
                <Button variant="outline" onClick={handleResendCode} disabled={verifying} className="w-full">
                  Resend Code
                </Button>
              </div>
              {verifyMessage && <div className="text-sm text-gray-700">{verifyMessage}</div>}
              <div className="pt-4">
                <Link href="/">
                  <Button variant="ghost" className="w-full">Back to Home</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-4"
          >
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
          </div>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="text-center pb-8 bg-gradient-to-r from-emerald-50 to-green-50 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-gray-900 mb-3 pt-4">
              NGO Registration
            </CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Register your organization and connect with donors worldwide
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-7">
              {/* Organization Name & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Your Organization"
                    required
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Enter a secure password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className={`p-3 rounded-lg ${passwordStrength.bgColor}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        Password strength: {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.length ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-red-500" />
                        }
                        <span className={passwordStrength.checks.length ? "text-green-700" : "text-red-600"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.uppercase ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-red-500" />
                        }
                        <span className={passwordStrength.checks.uppercase ? "text-green-700" : "text-red-600"}>
                          Uppercase letter (A-Z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.lowercase ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-red-500" />
                        }
                        <span className={passwordStrength.checks.lowercase ? "text-green-700" : "text-red-600"}>
                          Lowercase letter (a-z)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.number ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-red-500" />
                        }
                        <span className={passwordStrength.checks.number ? "text-green-700" : "text-red-600"}>
                          Number (0-9)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordStrength.checks.special ? 
                          <Check className="h-3 w-3 text-green-500" /> : 
                          <X className="h-3 w-3 text-red-500" />
                        }
                        <span className={passwordStrength.checks.special ? "text-green-700" : "text-red-600"}>
                          Special character (!@#$%^&*)
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
                    className="pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                
                {/* Password Match Indicator */}
                {formData.confirmPassword && (
                  <div className={`flex items-center gap-2 p-2 rounded text-sm ${
                    passwordsMatch ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                  }`}>
                    {passwordsMatch ? 
                      <Check className="h-4 w-4 text-green-500" /> : 
                      <X className="h-4 w-4 text-red-500" />
                    }
                    <span>
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </span>
                  </div>
                )}
                
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
              </div>

              {/* Wallet */}
              <div className="space-y-3">
                <Label htmlFor="walletAddress">EVM Wallet Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="walletAddress"
                    value={formData.walletAddress}
                    onChange={(e) =>
                      handleInputChange("walletAddress", e.target.value)
                    }
                    placeholder="0x..."
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleConnectWallet}
                  >
                    Connect
                  </Button>
                </div>
                {walletError && (
                  <div className="text-red-500 text-xs mt-1">{walletError}</div>
                )}
              </div>

              {/* Description */}
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your organization's mission..."
                rows={4}
                required
              />

              {/* Website & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.org (optional)"
                />
                <Select
                  onValueChange={(value) =>
                    handleInputChange("category", value)
                  }
                >
                  <SelectTrigger>
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

              {/* Registration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  id="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={(e) =>
                    handleInputChange("registrationNumber", e.target.value)
                  }
                  placeholder="Registration Number"
                />
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) =>
                    handleInputChange("foundedYear", e.target.value)
                  }
                  placeholder="2020"
                />
                <Input
                  id="teamSize"
                  value={formData.teamSize}
                  onChange={(e) =>
                    handleInputChange("teamSize", e.target.value)
                  }
                  placeholder="Team Size"
                />
              </div>

              {/* Social */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  id="twitter"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange("twitter", e.target.value)}
                  placeholder="Twitter URL"
                />
                <Input
                  id="facebook"
                  value={formData.facebook}
                  onChange={(e) =>
                    handleInputChange("facebook", e.target.value)
                  }
                  placeholder="Facebook URL"
                />
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) =>
                    handleInputChange("linkedin", e.target.value)
                  }
                  placeholder="LinkedIn URL"
                />
              </div>

              {/* Terms */}
              <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                <Checkbox
                  id="terms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeTerms", checked as boolean)
                  }
                />
                <Label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the Terms of Service and Privacy Policy
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={
                  !formData.agreeTerms || 
                  submitting || 
                  passwordStrength.strength === 'weak' || 
                  !passwordsMatch ||
                  formData.password.length < 8
                }
              >
                <Shield className="w-5 h-5 mr-2" />
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>

              {/* Sign In Link */}
              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/ngo/login" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
