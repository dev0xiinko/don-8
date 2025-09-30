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
import { ArrowLeft, Shield, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [walletError, setWalletError] = useState("");

  const [formData, setFormData] = useState({
    userType: "ngo",
    name: "",
    email: "",
    password: "",
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
  };

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
    setSubmitting(true);

    try {
      sessionStorage.setItem("ngoProfile", JSON.stringify(formData));

      // @note Turning this API off for now

      // const res = await fetch("/api/ngo-application", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(formData),
      // });

      // if (!res.ok) throw new Error("Failed to submit application");

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit application.");
    } finally {
      setSubmitting(false);
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
              Please check your email for any updates regarding your
              application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700 w-full">
                Back to Home
              </Button>
            </Link>
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
                  placeholder="https://yourwebsite.org(optional)"
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
                disabled={!formData.agreeTerms || submitting}
              >
                <Shield className="w-5 h-5 mr-2" />
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
