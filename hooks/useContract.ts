import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { useWallet } from '@/contexts/WalletProvider'
import { getEnhancedDonationPlatform, DonationPlatformContract, isNetworkSupported } from '@/lib/contract-utils'
import { switchToBaseSepolia } from '@/lib/wallet-utils'

interface UseContractReturn {
  contract: DonationPlatformContract | null
  isLoading: boolean
  error: string | null
  switchToSupportedNetwork: () => Promise<void>
  isNetworkSupported: boolean
}

export const useContract = (): UseContractReturn => {
  const { walletInfo } = useWallet()
  const [contract, setContract] = useState<DonationPlatformContract | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [networkSupported, setNetworkSupported] = useState<boolean>(false)

  useEffect(() => {
    const initContract = async () => {
      if (!walletInfo || walletInfo.walletType !== 'metamask') {
        setIsLoading(false)
        setContract(null)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        // Check if the current network is supported
        const supported = isNetworkSupported(walletInfo.chainId)
        setNetworkSupported(supported)

        if (!supported) {
          setContract(null)
          setIsLoading(false)
          return
        }

        // Create provider
        const provider = new ethers.BrowserProvider(window.ethereum!)
        
        // Get contract
        const donationPlatform = await getEnhancedDonationPlatform(provider)
        setContract(donationPlatform)
      } catch (err: any) {
        console.error('Error initializing contract:', err)
        setError(err.message || 'Failed to initialize contract')
        setContract(null)
      } finally {
        setIsLoading(false)
      }
    }

    initContract()
  }, [walletInfo])

  const switchToSupportedNetwork = async () => {
    try {
      await switchToBaseSepolia()
      // The wallet info will update automatically through event listeners
      // which will trigger the useEffect above
    } catch (err: any) {
      console.error('Error switching network:', err)
      setError(err.message || 'Failed to switch network')
    }
  }

  return {
    contract,
    isLoading,
    error,
    switchToSupportedNetwork,
    isNetworkSupported: networkSupported
  }
}