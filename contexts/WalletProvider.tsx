"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
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
      },
    )

    return cleanup
  }, [])

  const connectWallet = async (walletType: "metamask" | "phantom") => {
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

      // Store connection for persistence
      storeWalletConnection(wallet.walletType, wallet.address)
    } catch (error) {
      console.error("Wallet connection error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    try {
      if (walletInfo) {
        await disconnectWallet(walletInfo.walletType)
      }
      handleDisconnect()
    } catch (error) {
      console.error("Disconnect error:", error)
      // Still clear local state even if disconnect fails
      handleDisconnect()
    }
  }

  const handleDisconnect = () => {
    setWalletInfo(null)
    setUserInfo(null)
    setIsConnected(false)
    clearWalletConnection()
  }

  const refreshWalletInfo = async () => {
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
  }

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
