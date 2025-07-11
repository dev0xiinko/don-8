"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Shield, Smartphone, Globe, ExternalLink } from "lucide-react"

export default function WalletSetupPage() {
  const wallets = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "The most popular Ethereum wallet for web browsers",
      platforms: ["Browser Extension", "Mobile App"],
      difficulty: "Beginner",
      downloadUrl: "https://metamask.io/download/",
      features: ["Easy to use", "Browser integration", "DApp support", "Mobile app"],
    },
    {
      name: "Trust Wallet",
      icon: "🛡️",
      description: "Mobile-first wallet with support for multiple blockchains",
      platforms: ["Mobile App"],
      difficulty: "Beginner",
      downloadUrl: "https://trustwallet.com/",
      features: ["Mobile-first", "Multi-chain", "Built-in DApp browser", "Staking support"],
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Self-custody wallet from Coinbase with easy onboarding",
      platforms: ["Browser Extension", "Mobile App"],
      difficulty: "Beginner",
      downloadUrl: "https://wallet.coinbase.com/",
      features: ["Easy onboarding", "DeFi integration", "NFT support", "Cloud backup"],
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Protocol for connecting mobile wallets to desktop DApps",
      platforms: ["Protocol"],
      difficulty: "Intermediate",
      downloadUrl: "https://walletconnect.com/",
      features: ["Cross-platform", "QR code connection", "Multiple wallet support", "Secure"],
    },
  ]

  const steps = [
    {
      number: 1,
      title: "Choose a Wallet",
      description: "Select a wallet that suits your needs and experience level",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      number: 2,
      title: "Download & Install",
      description: "Download the wallet app or browser extension from the official website",
      icon: <Download className="w-6 h-6" />,
    },
    {
      number: 3,
      title: "Create Account",
      description: "Follow the setup process and securely store your recovery phrase",
      icon: <Smartphone className="w-6 h-6" />,
    },
    {
      number: 4,
      title: "Connect to DON-8",
      description: "Return to DON-8 and connect your newly created wallet",
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/login" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D8</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">DON-8</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Set Up Your Web3 Wallet</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A Web3 wallet is required to use DON-8. Choose from our recommended wallets and follow the setup guide.
            </p>
          </div>
        </div>

        {/* How It Works */}
        <Card className="mb-8 shadow-lg border-0">
          <CardHeader>
            <CardTitle>How to Set Up Your Wallet</CardTitle>
            <CardDescription>Follow these simple steps to get started with Web3</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div key={step.number} className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {step.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommended Wallets */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Recommended Wallets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <Card key={wallet.name} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-3xl">{wallet.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{wallet.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant={wallet.difficulty === "Beginner" ? "secondary" : "outline"} className="text-xs">
                          {wallet.difficulty}
                        </Badge>
                        {wallet.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <CardDescription>{wallet.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Features:</h4>
                      <div className="flex flex-wrap gap-1">
                        {wallet.features.map((feature) => (
                          <Badge key={feature} variant="outline" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button className="w-full" onClick={() => window.open(wallet.downloadUrl, "_blank")}>
                      <Download className="w-4 h-4 mr-2" />
                      Download {wallet.name}
                      <ExternalLink className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Security Tips */}
        <Card className="shadow-lg border-0 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center text-yellow-800">
              <Shield className="w-5 h-5 mr-2" />
              Security Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-700">
              <div>
                <h4 className="font-medium mb-2">✅ Do:</h4>
                <ul className="space-y-1">
                  <li>• Write down your recovery phrase on paper</li>
                  <li>• Store it in a safe, offline location</li>
                  <li>• Double-check wallet addresses before sending</li>
                  <li>• Use official wallet websites only</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">❌ Don't:</h4>
                <ul className="space-y-1">
                  <li>• Share your recovery phrase with anyone</li>
                  <li>• Store it digitally or in cloud storage</li>
                  <li>• Download wallets from unofficial sources</li>
                  <li>• Ignore security warnings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">Already have a wallet set up?</p>
          <Link href="/login">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Connect Your Wallet
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
