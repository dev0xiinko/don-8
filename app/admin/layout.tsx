"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Skip auth check for login page
    if (pathname === "/admin/login") {
      setIsLoading(false)
      return
    }

    // Check admin session
    const session = localStorage.getItem("admin_session")
    const cookieSession = document.cookie.split("; ").find((row) => row.startsWith("admin_session="))

    if (session || cookieSession) {
      setIsAuthenticated(true)
    } else {
      router.push("/admin/login")
    }

    setIsLoading(false)
  }, [pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page without auth check
  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  // Show dashboard only if authenticated
  if (isAuthenticated) {
    return <>{children}</>
  }

  // This shouldn't render due to redirect, but just in case
  return null
}
