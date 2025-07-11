import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Web3AuthProvider } from "@/context/Web3AuthProvider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "DON-8 - Transparent Blockchain Donations",
  description: "Blockchain-powered decentralized donation platform for transparent, low-cost NGO resource allocation.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Web3AuthProvider>
            {children}
          </Web3AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
