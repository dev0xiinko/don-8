import { ethers } from "ethers"
import { getWeb3Auth } from "./web3auth-config"

export interface WalletInfo {
  address: string
  balance: string
  chainId: string
  provider: any
  connectionType: "web3auth" | "injected"
}

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined" && window.ethereum.isMetaMask
}

// Check if any wallet is installed
export const isWalletInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
}

// Connect to MetaMask directly
export const connectMetaMask = async (): Promise<WalletInfo> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.")
    }

    // Switch to SonicLabs Network
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x39" }], // SonicLabs chainId
      })
    } catch (switchError: any) {
      // If network doesn't exist, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x39",
              chainName: "SonicLabs Network",
              nativeCurrency: {
                name: "Sonic",
                symbol: "S",
                decimals: 18,
              },
              rpcUrls: ["https://rpc.soniclabs.com"],
              blockExplorerUrls: ["https://explorer.soniclabs.com"],
            },
          ],
        })
      } else {
        throw switchError
      }
    }

    // Create provider and get wallet info
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const balance = await provider.getBalance(address)
    const network = await provider.getNetwork()

    return {
      address,
      balance: ethers.formatEther(balance),
      chainId: network.chainId.toString(),
      provider,
      connectionType: "injected",
    }
  } catch (error: any) {
    console.error("MetaMask connection error:", error)
    throw new Error(error.message || "Failed to connect to MetaMask")
  }
}

// Connect via Web3Auth
export const connectWeb3Auth = async (loginProvider?: string): Promise<WalletInfo> => {
  const web3auth = getWeb3Auth()
  if (!web3auth) {
    throw new Error("Web3Auth not initialized")
  }

  try {
    let provider: any

    if (loginProvider) {
      // Connect with specific social provider
      provider = await web3auth.connectTo("openlogin", {
        loginProvider,
      })
    } else {
      // Connect with Web3Auth modal
      provider = await web3auth.connect()
    }

    if (!provider) {
      throw new Error("Failed to connect with Web3Auth")
    }

    // Create ethers provider
    const ethersProvider = new ethers.BrowserProvider(provider)
    const signer = await ethersProvider.getSigner()
    const address = await signer.getAddress()
    const balance = await ethersProvider.getBalance(address)
    const network = await ethersProvider.getNetwork()

    return {
      address,
      balance: ethers.formatEther(balance),
      chainId: network.chainId.toString(),
      provider: ethersProvider,
      connectionType: "web3auth",
    }
  } catch (error: any) {
    console.error("Web3Auth connection error:", error)
    throw new Error(error.message || "Failed to connect with Web3Auth")
  }
}

// Get user info from Web3Auth
export const getWeb3AuthUserInfo = async () => {
  const web3auth = getWeb3Auth()
  if (!web3auth || !web3auth.connected) {
    return null
  }

  try {
    return await web3auth.getUserInfo()
  } catch (error) {
    console.error("Error getting user info:", error)
    return null
  }
}

// Disconnect wallet
export const disconnectWallet = async () => {
  const web3auth = getWeb3Auth()
  if (web3auth && web3auth.connected) {
    await web3auth.logout()
  }

  // Clear any stored connection data
  if (typeof window !== "undefined") {
    localStorage.removeItem("wallet-connection")
  }
}

// Check if connected
export const isConnected = (): boolean => {
  const web3auth = getWeb3Auth()
  return (web3auth && web3auth.connected) || isWalletInstalled()
}

// Get current connection info
export const getCurrentWalletInfo = async (): Promise<WalletInfo | null> => {
  try {
    const web3auth = getWeb3Auth()

    // Check Web3Auth connection first
    if (web3auth && web3auth.connected) {
      const provider = web3auth.provider
      if (provider) {
        const ethersProvider = new ethers.BrowserProvider(provider)
        const signer = await ethersProvider.getSigner()
        const address = await signer.getAddress()
        const balance = await ethersProvider.getBalance(address)
        const network = await ethersProvider.getNetwork()

        return {
          address,
          balance: ethers.formatEther(balance),
          chainId: network.chainId.toString(),
          provider: ethersProvider,
          connectionType: "web3auth",
        }
      }
    }

    // Check injected wallet connection
    if (isWalletInstalled() && window.ethereum.selectedAddress) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const balance = await provider.getBalance(address)
      const network = await provider.getNetwork()

      return {
        address,
        balance: ethers.formatEther(balance),
        chainId: network.chainId.toString(),
        provider,
        connectionType: "injected",
      }
    }

    return null
  } catch (error) {
    console.error("Error getting current wallet info:", error)
    return null
  }
}

// Listen for account changes
export const setupWalletListeners = (
  onAccountChange: (accounts: string[]) => void,
  onChainChange: (chainId: string) => void,
) => {
  if (typeof window !== "undefined" && window.ethereum) {
    window.ethereum.on("accountsChanged", onAccountChange)
    window.ethereum.on("chainChanged", onChainChange)

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccountChange)
      window.ethereum.removeListener("chainChanged", onChainChange)
    }
  }
  return () => {}
}
