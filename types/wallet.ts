export interface WalletInfo {
  address: string
  balance: string
  chainId: string
  network: string
  walletType: "metamask" | "phantom"
}

export interface UserInfo {
  address: string
  walletType: "metamask" | "phantom"
  network: string
  ensName?: string
}

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      selectedAddress: string | null
    }
    solana?: {
      isPhantom?: boolean
      connect: () => Promise<{ publicKey: { toString: () => string } }>
      disconnect: () => Promise<void>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      publicKey?: { toString: () => string }
      isConnected: boolean
    }
  }
}
