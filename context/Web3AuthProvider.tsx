"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, type IProvider } from "@web3auth/base"
import Web3 from "web3"

interface UserInfo {
  email?: string
  name?: string
  profileImage?: string
  verifier?: string
  verifierId?: string
  typeOfLogin?: string
}

interface WalletInfo {
  address: string
  balance: string
  chainId: string
}

interface Web3AuthContextType {
  web3auth: Web3Auth | null
  provider: IProvider | null
  isLoading: boolean
  isConnected: boolean
  userInfo: UserInfo | null
  walletInfo: WalletInfo | null
  login: () => Promise<void>
  logout: () => Promise<void>
  getUserInfo: () => Promise<UserInfo | null>
  getWalletInfo: () => Promise<WalletInfo | null>
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null)

const clientId = process.env.NEXT_PUBLIC_WEB3AUTH_CLIENT_ID || ""

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [web3auth, setWeb3auth] = useState<Web3Auth | null>(null)
  const [provider, setProvider] = useState<IProvider | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)

  useEffect(() => {
    const init = async () => {
      try {
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: "0x13881", // Mumbai testnet
            rpcTarget: "https://rpc-mumbai.maticvigil.com",
            displayName: "Polygon Mumbai",
            blockExplorerUrl: "https://mumbai.polygonscan.com",
            ticker: "MATIC",
            tickerName: "Polygon",
          },
          uiConfig: {
            appName: "DON-8",
            appUrl: "https://don8.app",
            logoLight: "https://don8.app/logo-light.png",
            logoDark: "https://don8.app/logo-dark.png",
            defaultLanguage: "en",
            mode: "auto",
            theme: {
              primary: "#10b981",
            },
          },
        })

        await web3authInstance.initModal()
        setWeb3auth(web3authInstance)

        if (web3authInstance.connected && web3authInstance.provider) {
          setProvider(web3authInstance.provider)
          setIsConnected(true)

          const user = await web3authInstance.getUserInfo()
          setUserInfo(user)

          const wallet = await getWalletInfoFromProvider(web3authInstance.provider)
          setWalletInfo(wallet)
        }
      } catch (err) {
        console.error("Web3Auth init error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    init()
  }, [])

  const getWalletInfoFromProvider = async (provider: IProvider): Promise<WalletInfo | null> => {
    try {
      const web3 = new Web3(provider as any)
      const accounts = await web3.eth.getAccounts()
      if (!accounts || accounts.length === 0) return null
      const balance = await web3.eth.getBalance(accounts[0])
      const chainId = await web3.eth.getChainId()
      return {
        address: accounts[0],
        balance: web3.utils.fromWei(balance, "ether"),
        chainId: chainId.toString(),
      }
    } catch (err) {
      console.error("Wallet info error:", err)
      return null
    }
  }

  const login = async () => {
    if (!web3auth) throw new Error("Web3Auth not initialized")
    const web3authProvider = await web3auth.connect()
    if (!web3authProvider) throw new Error("Failed to connect")

    setProvider(web3authProvider)
    setIsConnected(true)

    const user = await web3auth.getUserInfo()
    setUserInfo(user)

    const wallet = await getWalletInfoFromProvider(web3authProvider)
    setWalletInfo(wallet)

    localStorage.setItem(
      "don8_session",
      JSON.stringify({ user, wallet, timestamp: Date.now() }),
    )
  }

  const logout = async () => {
    if (!web3auth) return
    await web3auth.logout()
    setProvider(null)
    setIsConnected(false)
    setUserInfo(null)
    setWalletInfo(null)
    localStorage.removeItem("don8_session")
  }

  const getUserInfo = async () => {
    if (!web3auth?.connected) return null
    const user = await web3auth.getUserInfo()
    setUserInfo(user)
    return user
  }

  const getWalletInfo = async () => {
    if (!provider) return null
    const wallet = await getWalletInfoFromProvider(provider)
    setWalletInfo(wallet)
    return wallet
  }

  const value: Web3AuthContextType = {
    web3auth,
    provider,
    isLoading,
    isConnected,
    userInfo,
    walletInfo,
    login,
    logout,
    getUserInfo,
    getWalletInfo,
  }

  return <Web3AuthContext.Provider value={value}>{children}</Web3AuthContext.Provider>
}

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext)
  if (!context) throw new Error("useWeb3Auth must be used within a Web3AuthProvider")
  return context
}
