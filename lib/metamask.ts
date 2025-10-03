declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      selectedAddress: string | null
    }
  }
}



export async function connectWallet(): Promise<string | null> {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed. Please install MetaMask to continue.")
    return null
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    return accounts[0]
  } catch (error) {
    console.error("Error connecting to MetaMask:", error)
    return null
  }
}

export async function getBalance(address: string): Promise<number> {
  if (typeof window.ethereum === "undefined") {
    return 0
  }

  try {
    const balance = await window.ethereum.request({
      method: "eth_getBalance",
      params: [address, "latest"],
    })

    // Convert from Wei to ETH
    const ethBalance = Number.parseInt(balance, 16) / Math.pow(10, 18)
    return Number.parseFloat(ethBalance.toFixed(4))
  } catch (error) {
    console.error("Error getting balance:", error)
    return 0
  }
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export async function getBalanceFromAddress(address: string): Promise<number> {
  try {
    // Try MetaMask first if available
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })
      const ethBalance = Number.parseInt(balance, 16) / Math.pow(10, 18)
      return Number.parseFloat(ethBalance.toFixed(4))
    }

    // Fallback to public RPC endpoint (Ethereum mainnet)
    const response = await fetch("https://eth.llamarpc.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_getBalance",
        params: [address, "latest"],
        id: 1,
      }),
    })

    const data = await response.json()
    if (data.result) {
      const ethBalance = Number.parseInt(data.result, 16) / Math.pow(10, 18)
      return Number.parseFloat(ethBalance.toFixed(4))
    }

    return 0
  } catch (error) {
    console.error("Error getting balance from address:", error)
    return 0
  }
}
