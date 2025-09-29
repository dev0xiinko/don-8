"use client"

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react"
import type { WalletInfo, UserInfo } from "@/types/wallet"
import {
  connectMetaMask,
  connectPhantom,
  disconnectWallet,
  getCurrentWalletInfo,
  setupWalletListeners,
  storeWalletConnection,
  clearWalletConnection,
  isMetaMaskInstalled,
  isPhantomInstalled,
} from "@/lib/wallet-utils"

interface WalletContextType {
  isConnected: boolean
  isLoading: boolean
  walletInfo: WalletInfo | null
  userInfo: UserInfo | null
  connectWallet: (walletType: "metamask" | "phantom") => Promise<void>
  disconnect: () => Promise<void>
  refreshWalletInfo: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | null>(null)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)

  // Handle disconnect
  const handleDisconnect = useCallback(() => {
    setWalletInfo(null)
    setUserInfo(null)
    setIsConnected(false)
    clearWalletConnection()
    document.cookie = "wallet_connected=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }, [])

  const refreshWalletInfo = useCallback(async () => {
    try {
      const currentWallet = await getCurrentWalletInfo()
      if (currentWallet) {
        setWalletInfo(currentWallet)
        setUserInfo({
          address: currentWallet.address,
          walletType: currentWallet.walletType,
          network: currentWallet.network,
        })
        setIsConnected(true)
      } else {
        handleDisconnect()
      }
    } catch (error) {
      console.error("Error refreshing wallet info:", error)
      handleDisconnect()
    }
  }, [handleDisconnect])

  // Initialize wallet connection on mount
  useEffect(() => {
    const initializeWallet = async () => {
      try {
        const currentWallet = await getCurrentWalletInfo()
        if (currentWallet) {
          setWalletInfo(currentWallet)
          setUserInfo({
            address: currentWallet.address,
            walletType: currentWallet.walletType,
            network: currentWallet.network,
          })
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error initializing wallet:", error)
        clearWalletConnection()
      } finally {
        setIsLoading(false)
      }
    }

    initializeWallet()
  }, [])

  // Setup wallet event listeners
  useEffect(() => {
    const cleanup = setupWalletListeners(
      (accounts) => {
        if (accounts.length > 0) {
          refreshWalletInfo()
        }
      },
      () => {
        refreshWalletInfo()
      },
      () => {
        handleDisconnect()
      }
    )

    return typeof cleanup === "function" ? cleanup : undefined
  }, [refreshWalletInfo, handleDisconnect])

  const connectWallet = useCallback(async (walletType: "metamask" | "phantom") => {
    try {
      setIsLoading(true)

      let wallet: WalletInfo

      if (walletType === "metamask") {
        if (!isMetaMaskInstalled()) {
          throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
        }
        wallet = await connectMetaMask()
      } else if (walletType === "phantom") {
        if (!isPhantomInstalled()) {
          throw new Error("Phantom wallet is not installed. Please install Phantom to continue.")
        }
        wallet = await connectPhantom()
      } else {
        throw new Error("Unsupported wallet type")
      }

      setWalletInfo(wallet)
      setUserInfo({
        address: wallet.address,
        walletType: wallet.walletType,
        network: wallet.network,
      })
      setIsConnected(true)
      storeWalletConnection(wallet.walletType, wallet.address)
      document.cookie = `wallet_connected=true; path=/; max-age=${60 * 60 * 24 * 7}` // 7 days
    } catch (error) {
      console.error("Wallet connection error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    try {
      if (walletInfo) {
        await disconnectWallet(walletInfo.walletType)
      }
    } catch (error) {
      console.error("Disconnect error:", error)
    } finally {
      handleDisconnect()
    }
  }, [walletInfo, handleDisconnect])

  const value: WalletContextType = {
    isConnected,
    isLoading,
    walletInfo,
    userInfo,
    connectWallet,
    disconnect,
    refreshWalletInfo,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
