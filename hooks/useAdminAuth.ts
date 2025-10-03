"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

export interface AdminSession {
  id: string
  email?: string
  walletAddress?: string
  role: string
  token: string
  loginTime: string
  authType?: string
  isWalletAuth?: boolean
}

export function useAdminAuth() {
  const [adminSession, setAdminSession] = useState<AdminSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const checkAdminSession = () => {
    const session = localStorage.getItem("admin_session")
    if (session) {
      try {
        const parsedSession: AdminSession = JSON.parse(session)
        setAdminSession(parsedSession)
        return parsedSession
      } catch (error) {
        console.error("Error parsing admin session:", error)
        logout()
      }
    }
    return null
  }

  const logout = () => {
    localStorage.removeItem("admin_session")
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT"
    setAdminSession(null)
    router.push("/admin/login")
  }

  const isAuthenticated = () => {
    return adminSession !== null
  }

  const getAuthHeaders = () => {
    if (adminSession?.token) {
      return {
        'Authorization': `Bearer ${adminSession.token}`,
        'Content-Type': 'application/json'
      }
    }
    return { 'Content-Type': 'application/json' }
  }

  useEffect(() => {
    console.log('useAdminAuth: Checking session...')
    const session = checkAdminSession()
    setIsLoading(false)
    
    console.log('useAdminAuth: Session check result:', { 
      session: !!session, 
      pathname: typeof window !== 'undefined' ? window.location.pathname : 'server' 
    })
    
    // If no session and we're not on the login page, redirect
    if (!session && typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
      console.log('useAdminAuth: No session found, redirecting to login')
      router.push("/admin/login")
    }
  }, [router])

  return {
    adminSession,
    isLoading,
    isAuthenticated,
    logout,
    getAuthHeaders,
    checkAdminSession
  }
}