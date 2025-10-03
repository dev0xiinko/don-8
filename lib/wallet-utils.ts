import { ethers, BrowserProvider, formatEther } from "ethers";
import type { WalletInfo } from "@/types/wallet"

// MetaMask utilities
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined" && !!window.ethereum.isMetaMask
}

export const connectMetaMask = async (): Promise<WalletInfo> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
  }

  try {
    // Request account access
    const accounts = await window.ethereum!.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found. Please unlock MetaMask.");
    }

    // Create provider using ethers v6
    const provider = new BrowserProvider(window.ethereum!);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const balance = await provider.getBalance(address);
    const network = await provider.getNetwork();

    // Format balance using ethers v6
    const formattedBalance = formatEther(balance);

    return {
      address,
      balance: formattedBalance,
      chainId: network.chainId.toString(),
      network: network.name,
      walletType: "metamask",
    };
  } catch (error: any) {
    console.error("MetaMask connection error:", error);
    throw new Error(error.message || "Failed to connect to MetaMask");
  }
}

export const switchToEthereumMainnet = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    await window.ethereum!.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x1" }], // Ethereum Mainnet
    })
  } catch (error: any) {
    console.error("Network switch error:", error)
    throw new Error("Failed to switch to Ethereum Mainnet")
  }
}

export const switchToBaseSepolia = async (): Promise<void> => {
  if (!isMetaMaskInstalled()) {
    throw new Error("MetaMask is not installed")
  }

  try {
    // Try to switch to Base Sepolia
    try {
      await window.ethereum!.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x14a34" }], // Base Sepolia chainId (84532 in hex)
      })
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        await window.ethereum!.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x14a34", // Base Sepolia chainId (84532 in hex)
              chainName: "Base Sepolia",
              nativeCurrency: {
                name: "Sepolia ETH",
                symbol: "ETH",
                decimals: 18,
              },
              rpcUrls: ["https://sepolia.base.org"],
              blockExplorerUrls: ["https://sepolia.basescan.org"],
            },
          ],
        })
      } else {
        throw switchError
      }
    }
  } catch (error: any) {
    console.error("Network switch error:", error)
    throw new Error("Failed to switch to Base Sepolia")
  }
}

// Phantom utilities
export const isPhantomInstalled = (): boolean => {
  return typeof window !== "undefined" && typeof window.solana !== "undefined" && !!window.solana.isPhantom
}

export const connectPhantom = async (): Promise<WalletInfo> => {
  if (!isPhantomInstalled()) {
    throw new Error("Phantom wallet is not installed. Please install Phantom to continue.")
  }

  try {
    const response = await window.solana!.connect()
    const address = response.publicKey.toString()

    // For Phantom, we'll simulate balance (in a real app, you'd fetch from Solana RPC)
    const balance = "0.0000" // Placeholder - would need Solana connection to get real balance

    return {
      address,
      balance,
      chainId: "solana-mainnet",
      network: "Solana Mainnet",
      walletType: "phantom",
    }
  } catch (error: any) {
    console.error("Phantom connection error:", error)
    throw new Error(error.message || "Failed to connect to Phantom")
  }
}

// General utilities
export const disconnectWallet = async (walletType: "metamask" | "phantom"): Promise<void> => {
  try {
    if (walletType === "phantom" && window.solana) {
      await window.solana.disconnect()
    }
    // MetaMask doesn't have a disconnect method - user needs to disconnect manually

    // Clear stored connection data
    localStorage.removeItem("wallet-connection")
  } catch (error) {
    console.error("Disconnect error:", error)
  }
}

export const getStoredWalletConnection = (): { walletType: "metamask" | "phantom"; address: string } | null => {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("wallet-connection")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export const storeWalletConnection = (walletType: "metamask" | "phantom", address: string): void => {
  if (typeof window === "undefined") return

  localStorage.setItem("wallet-connection", JSON.stringify({ walletType, address }))
}

export const clearWalletConnection = (): void => {
  if (typeof window === "undefined") return

  localStorage.removeItem("wallet-connection")
}

// Get current wallet info
export const getCurrentWalletInfo = async (): Promise<WalletInfo | null> => {
  const stored = getStoredWalletConnection()
  if (!stored) return null

  try {
    if (stored.walletType === "metamask" && isMetaMaskInstalled()) {
      if (window.ethereum!.selectedAddress) {
        return await connectMetaMask()
      }
    } else if (stored.walletType === "phantom" && isPhantomInstalled()) {
      if (window.solana!.isConnected) {
        return await connectPhantom()
      }
    }
  } catch (error) {
    console.error("Error getting current wallet info:", error)
    clearWalletConnection()
  }

  return null
}

// Setup wallet event listeners
export const setupWalletListeners = (
  onAccountChange: (accounts: string[]) => void,
  onChainChange: (chainId: string) => void,
  onDisconnect: () => void,
) => {
  const cleanup: (() => void)[] = []

  // MetaMask listeners
  if (isMetaMaskInstalled()) {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        onDisconnect()
      } else {
        onAccountChange(accounts)
      }
    }

    const handleChainChanged = (chainId: string) => {
      onChainChange(chainId)
    }

    window.ethereum!.on("accountsChanged", handleAccountsChanged)
    window.ethereum!.on("chainChanged", handleChainChanged)

    cleanup.push(() => {
      window.ethereum!.removeListener("accountsChanged", handleAccountsChanged)
      window.ethereum!.removeListener("chainChanged", handleChainChanged)
    })
  }

  // Phantom listeners
  if (isPhantomInstalled()) {
    const handleDisconnect = () => {
      onDisconnect()
    }

    window.solana!.on("disconnect", handleDisconnect)

    cleanup.push(() => {
      window.solana!.removeListener("disconnect", handleDisconnect)
    })
  }

  return () => {
    cleanup.forEach((fn) => fn())
  }
}
