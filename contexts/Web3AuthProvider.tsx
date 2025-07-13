"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK, type IProvider } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
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

const clientId = "BBgJUg3TvBJ4hSMILiqLPqgByN9LzkcsFnYNynzOnp2h0D9KlgrIqPYNG8SDI2s0zhr4LzuH7v6qq1VnjVJgjJE"

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1", // Ethereum Mainnet
  rpcTarget: "https://rpc.ankr.com/eth",
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
}

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
        // Initialize the private key provider
        const privateKeyProvider = new EthereumPrivateKeyProvider({
          config: { chainConfig },
        })

        // Initialize Web3Auth
        const web3authInstance = new Web3Auth({
          clientId,
          web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
          privateKeyProvider,
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

        // Initialize the modal
        await web3authInstance.initModal()
        setWeb3auth(web3authInstance)

        // Check if already connected
        if (web3authInstance.connected) {
          setProvider(web3authInstance.provider)
          setIsConnected(true)

          // Get user info
          try {
            const user = await web3authInstance.getUserInfo()
            setUserInfo(user)
          } catch (error) {
            console.log("No user info available")
          }

          // Get wallet info
          if (web3authInstance.provider) {
            const wallet = await getWalletInfoFromProvider(web3authInstance.provider)
            setWalletInfo(wallet)
          }
        }
      } catch (error) {
        console.error("Error initializing Web3Auth:", error)
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

      if (accounts.length === 0) {
        return null
      }

      const balance = await web3.eth.getBalance(accounts[0])
      const chainId = await web3.eth.getChainId()

      return {
        address: accounts[0],
        balance: web3.utils.fromWei(balance, "ether"),
        chainId: chainId.toString(),
      }
    } catch (error) {
      console.error("Error getting wallet info:", error)
      return null
    }
  }

  const login = async () => {
    if (!web3auth) {
      throw new Error("Web3Auth not initialized")
    }

    try {
      const web3authProvider = await web3auth.connect()

      if (!web3authProvider) {
        throw new Error("Failed to connect")
      }

      setProvider(web3authProvider)
      setIsConnected(true)

      // Get user info
      try {
        const user = await web3auth.getUserInfo()
        setUserInfo(user)
      } catch (error) {
        console.log("No user info available")
      }

      // Get wallet info
      const wallet = await getWalletInfoFromProvider(web3authProvider)
      setWalletInfo(wallet)

      // Store session
      localStorage.setItem(
        "don8_session",
        JSON.stringify({
          user: userInfo,
          wallet,
          timestamp: Date.now(),
        }),
      )
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = async () => {
    if (!web3auth) {
      return
    }

    try {
      await web3auth.logout()
      setProvider(null)
      setIsConnected(false)
      setUserInfo(null)
      setWalletInfo(null)
      localStorage.removeItem("don8_session")
    } catch (error) {
      console.error("Logout error:", error)
      throw error
    }
  }

  const getUserInfo = async (): Promise<UserInfo | null> => {
    if (!web3auth || !web3auth.connected) {
      return null
    }

    try {
      const user = await web3auth.getUserInfo()
      setUserInfo(user)
      return user
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  }

  const getWalletInfo = async (): Promise<WalletInfo | null> => {
    if (!provider) {
      return null
    }

    try {
      const wallet = await getWalletInfoFromProvider(provider)
      setWalletInfo(wallet)
      return wallet
    } catch (error) {
      console.error("Error getting wallet info:", error)
      return null
    }
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
  if (!context) {
    throw new Error("useWeb3Auth must be used within a Web3AuthProvider")
  }
  return context
}
