"use client"

import { useRouter } from "next/navigation"
import { useWallet } from "@/contexts/WalletProvider"

export default function useAuthRedirect() {
  const router = useRouter()
  const { isConnected } = useWallet()

  const redirectToDonate = (campaignId: string) => {
    router.push(`/campaign/${campaignId}`)
  }

  const redirectToDashboard = (userType: 'donor' | 'ngo' = 'donor') => {
    if (!isConnected) {
      router.push(`/login?redirect=${encodeURIComponent(`/${userType}/dashboard`)}`)
    } else {
      router.push(`/${userType}/dashboard`)
    }
  }

  const redirectToCampaigns = () => {
    router.push('/campaigns')
  }

  return {
    redirectToDonate,
    redirectToDashboard,
    redirectToCampaigns,
    isConnected
  }
}