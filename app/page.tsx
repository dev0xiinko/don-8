import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { Shield, Zap, Eye, Users, TrendingUp, Globe, ArrowRight } from "lucide-react"
import App from "@/components/web3auth/App"

export default function HomePage() {
  const features = [
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Blockchain Security",
      description: "Immutable transactions with smart contract automation for guaranteed security and compliance",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Real-Time Tracking",
      description: "Track every donation from source to impact with complete transparency and audit trails",
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "NGO Scoring",
      description: "Dynamic performance evaluation based on fund utilization, compliance, and project outcomes",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Zero Fees",
      description: "Direct peer-to-peer transactions eliminate middlemen and reduce costs to near zero",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Currency",
      description: "Accept donations in multiple cryptocurrencies for fast, borderless transactions",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Privacy Options",
      description: "Choose to donate anonymously or publicly while maintaining complete transaction transparency",
    },
  ]

  const stats = [
    { value: "$2.5M+", label: "Total Donations" },
    { value: "150+", label: "Verified NGOs" },
    { value: "5,000+", label: "Active Donors" },
    { value: "99.9%", label: "Transparency Rate" },
  ]

  const steps = [
    {
      number: "01",
      title: "Connect & Browse",
      description: "Sign in with Web3Auth and discover verified NGOs with performance scores",
    },
    {
      number: "02",
      title: "Smart Contracts",
      description: "Funds are secured in smart contracts and released based on compliance requirements",
    },
    {
      number: "03",
      title: "Track Impact",
      description: "Monitor real-time fund utilization and project outcomes through blockchain records",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">D8</span>
            </div>
            <span className="text-xl font-bold">DON-8</span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-emerald-600 hover:bg-emerald-700">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            Powered by Blockchain Technology
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transparent Donations,
            <br />
            <span className="text-emerald-600">Real Impact</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            DON-8 eliminates intermediaries and ensures every donation is tracked in real-time through blockchain
            technology. Support NGOs with complete transparency and zero hidden fees.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register?type=donor">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
                Start Donating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/register?type=ngo">
              <Button size="lg" variant="outline">
                Register NGO
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-emerald-600 mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose DON-8?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built on blockchain technology to solve traditional donation platform limitations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, transparent, and secure donation process powered by blockchain
            </p>
          </div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Charitable Giving?</h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of donors and NGOs already using DON-8 for transparent, efficient charitable giving
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?type=donor">
              <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
                Start Donating Today
              </Button>
            </Link>
            <Link href="/register?type=ngo">
              <Button
                size="lg"
                variant="outline"
                className="text-white border-white hover:bg-white hover:text-emerald-600 bg-transparent"
              >
                Register Your NGO
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">D8</span>
                </div>
                <span className="text-xl font-bold">DON-8</span>
              </div>
              <p className="text-muted-foreground">
                Blockchain-powered decentralized donation platform for transparent, low-cost NGO resource allocation.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="hover:text-foreground transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-foreground transition-colors">
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/compliance" className="hover:text-foreground transition-colors">
                    Compliance
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 DON-8. All rights reserved. Built with blockchain technology for transparent giving.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
