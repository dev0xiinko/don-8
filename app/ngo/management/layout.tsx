"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  BarChart3,
  Zap
} from "lucide-react"

interface SidebarNavProps {
  items: {
    title: string
    href: string
    icon: ReactNode
  }[]
}

function SidebarNav({ items }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <nav className="grid gap-2 px-2">
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent ${
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            }`}
          >
            {item.icon}
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}

export default function NGOManagementLayout({ children }: { children: React.ReactNode }) {
  const sidebarNavItems = [
    {
      title: "Dashboard",
      href: "/ngo/management",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: "Campaigns",
      href: "/ngo/management/campaigns",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: "Reports",
      href: "/ngo/management/reports",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      title: "Donors",
      href: "/ngo/management/donors",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "Analytics",
      href: "/ngo/management/analytics",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      title: "Settings",
      href: "/ngo/management/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">DON-8</span>
            </Link>
            <span className="text-sm text-muted-foreground">NGO Management</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt="Avatar" />
                <AvatarFallback>EF</AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Education for All</p>
                <p className="text-xs text-muted-foreground">contact@educationforall.org</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>
      <div className="container flex-1 items-start md:grid md:grid-cols-[220px_1fr] md:gap-6 lg:grid-cols-[240px_1fr] lg:gap-10">
        <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
          <div className="h-full py-6 pr-6 lg:py-8">
            <SidebarNav items={sidebarNavItems} />
          </div>
        </aside>
        <main className="flex w-full flex-col overflow-hidden pt-6">{children}</main>
      </div>
    </div>
  )
}