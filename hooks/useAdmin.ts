"use client"

import { useState, useEffect } from "react"

export interface NGOApplication {
  id: string
  organizationName: string
  email: string
  description: string
  category: string
  website?: string
  walletAddress: string
  status: "pending" | "under_review" | "approved" | "rejected"
  registrationNumber?: string
  foundedYear?: string
  teamSize?: string
  twitter?: string
  facebook?: string
  linkedin?: string
  createdAt: string
  updatedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewNotes?: string
}

export function useAdmin() {
  const [applications, setApplications] = useState<NGOApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch all NGO applications from backend
  const loadApplications = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/ngo-applications")
      const data: NGOApplication[] = await res.json()
      setApplications(data)
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update application status
  const updateApplicationStatus = async (
    applicationId: string,
    status: NGOApplication["status"],
    reviewNotes?: string,
  ) => {
    try {
      const res = await fetch(`/api/admin/ngo-applications/${applicationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNotes }),
      })
      if (!res.ok) throw new Error("Failed to update application")
      await loadApplications() // Refresh applications
      return true
    } catch (error) {
      console.error("Error updating application:", error)
      return false
    }
  }

  useEffect(() => {
    loadApplications()
  }, [])

  return {
    applications,
    isLoading,
    updateApplicationStatus,
    refreshApplications: loadApplications,
  }
}
