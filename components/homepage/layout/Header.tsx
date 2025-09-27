import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/themes/theme-toggle"

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">D8</span>
          </div>
          <span className="text-xl font-bold">DON-8</span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <Link href="#campaigns" className="text-muted-foreground hover:text-foreground transition-colors">
            Campaigns
          </Link>
          <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
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
  )
}