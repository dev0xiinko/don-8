"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@/contexts/WalletProvider"

export interface Donation {
  id: string
  ngoId: number
  ngoName: string
  amount: string
  currency: string
  txHash?: string
  status: "pending" | "completed" | "failed"
  date: string
  message?: string
  anonymous: boolean
}

export interface DonationStats {
  totalDonated: string
  totalDonations: number
  ngosSupported: number
  impactScore: number
}

export function useDonations() {
  const { userInfo, walletInfo } = useWallet()
  const [donations, setDonations] = useState<Donation[]>([])
  const [stats, setStats] = useState<DonationStats>({
    totalDonated: "0",
    totalDonations: 0,
    ngosSupported: 0,
    impactScore: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  // Load donations from localStorage on mount
  useEffect(() => {
    if (userInfo?.address) {
      loadDonations()
    }
  }, [userInfo?.address])

  const loadDonations = () => {
    try {
      const stored = localStorage.getItem(`donations_${userInfo?.address}`)
      const userDonations = stored ? JSON.parse(stored) : []
      setDonations(userDonations)
      calculateStats(userDonations)
    } catch (error) {
      console.error("Error loading donations:", error)
      setDonations([])
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStats = (userDonations: Donation[]) => {
    const completedDonations = userDonations.filter((d) => d.status === "completed")
    const totalDonated = completedDonations.reduce((sum, d) => sum + Number.parseFloat(d.amount), 0)
    const ngosSupported = new Set(completedDonations.map((d) => d.ngoId)).size
    const impactScore = Math.min(95, Math.floor(totalDonated * 10 + ngosSupported * 5))

    setStats({
      totalDonated: totalDonated.toFixed(4),
      totalDonations: completedDonations.length,
      ngosSupported,
      impactScore,
    })
  }

  const addDonation = (donation: Omit<Donation, "id" | "date">) => {
    const newDonation: Donation = {
      ...donation,
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
    }

    const updatedDonations = [newDonation, ...donations]
    setDonations(updatedDonations)
    calculateStats(updatedDonations)

    // Save to localStorage
    try {
      localStorage.setItem(`donations_${userInfo?.address}`, JSON.stringify(updatedDonations))
    } catch (error) {
      console.error("Error saving donation:", error)
    }

    return newDonation.id
  }

  const updateDonationStatus = (donationId: string, status: Donation["status"], txHash?: string) => {
    const updatedDonations = donations.map((d) =>
      d.id === donationId ? { ...d, status, ...(txHash && { txHash }) } : d,
    )
    setDonations(updatedDonations)
    calculateStats(updatedDonations)
    
    try {
      localStorage.setItem(`donations_${userInfo?.address}`, JSON.stringify(updatedDonations))
    } catch (error) {
      console.error("Error updating donation:", error)
    }
  }

  const getRecentDonations = (limit = 5) => {
    return donations.slice(0, limit)
  }

  return {
    donations,
    stats,
    isLoading,
    addDonation,
    updateDonationStatus,
    getRecentDonations,
    refreshDonations: loadDonations,
  }
}
