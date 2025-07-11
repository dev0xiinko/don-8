export const WEB3AUTH_CONFIG = {
  clientId: "BBgJUg3TvBJ4hSMILiqLPqgByN9LzkcsFnYNynzOnp2h0D9KlgrIqPYNG8SDI2s0zhr4LzuH7v6qq1VnjVJgjJE",
  clientSecret: "d2f64f6f37fa55bf68adb346f7dfeea8185232b8471d14ecea6df4923d1cfdbe",
  network: "testnet", // or "mainnet" for production
  chainConfig: {
    chainNamespace: "eip155",
    chainId: "0x39", // SonicLabs Network Chain ID (57 in decimal)
    rpcTarget: "https://rpc.soniclabs.com",
    displayName: "SonicLabs Network",
    blockExplorer: "https://explorer.soniclabs.com",
    ticker: "S",
    tickerName: "Sonic",
  },
}

// Mock Web3Auth implementation for demonstration
export class MockWeb3Auth {
  private isInitialized = false
  private provider: any = null
  private userInfo: any = null
  private connectionType: "social" | "wallet" | null = null

  async init() {
    // Simulate Web3Auth initialization
    await new Promise((resolve) => setTimeout(resolve, 1000))
    this.isInitialized = true
    console.log("Web3Auth initialized with SonicLabs Network")
  }

  async connectSocial(loginProvider: string) {
    if (!this.isInitialized) {
      throw new Error("Web3Auth not initialized")
    }

    // Simulate social login connection process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    this.connectionType = "social"

    // Mock user data based on provider
    this.userInfo = {
      email: `user${Math.floor(Math.random() * 1000)}@${loginProvider === "google" ? "gmail.com" : "example.com"}`,
      name: `${loginProvider.charAt(0).toUpperCase() + loginProvider.slice(1)} User ${Math.floor(Math.random() * 1000)}`,
      profileImage: `/placeholder.svg?height=32&width=32&text=${loginProvider.charAt(0).toUpperCase()}`,
      verifier: loginProvider,
      verifierId: `user_${Math.random().toString(36).substr(2, 9)}`,
      typeOfLogin: loginProvider,
    }

    // Mock provider with SonicLabs Network
    this.provider = {
      chainId: WEB3AUTH_CONFIG.chainConfig.chainId,
      networkVersion: "57",
      selectedAddress: `0x${Math.random().toString(16).substr(2, 40)}`,
      isConnected: true,
      connectionType: "social",
    }

    return this.provider
  }

  async connectWallet(walletType: string) {
    if (!this.isInitialized) {
      throw new Error("Web3Auth not initialized")
    }

    // Simulate wallet connection process
    await new Promise((resolve) => setTimeout(resolve, 1500))

    this.connectionType = "wallet"

    // Mock wallet connection data
    this.userInfo = {
      walletType,
      address: `0x${Math.random().toString(16).substr(2, 40)}`,
      connectionType: "wallet",
    }

    // Mock provider with SonicLabs Network
    this.provider = {
      chainId: WEB3AUTH_CONFIG.chainConfig.chainId,
      networkVersion: "57",
      selectedAddress: this.userInfo.address,
      isConnected: true,
      connectionType: "wallet",
      walletType,
    }

    return this.provider
  }

  async getUserInfo() {
    return this.userInfo
  }

  async logout() {
    this.provider = null
    this.userInfo = null
    this.connectionType = null
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  get connected() {
    return !!this.provider
  }

  get connectionType() {
    return this.connectionType
  }

  getProvider() {
    return this.provider
  }
}

export const web3auth = new MockWeb3Auth()

// Wallet connection utilities
export const SUPPORTED_WALLETS = [
  {
    name: "MetaMask",
    id: "metamask",
    icon: "🦊",
    description: "Connect using MetaMask browser extension",
    color: "bg-orange-50 hover:bg-orange-100 border-orange-200",
  },
  {
    name: "WalletConnect",
    id: "walletconnect",
    icon: "🔗",
    description: "Connect using WalletConnect protocol",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    name: "Coinbase Wallet",
    id: "coinbase",
    icon: "🔵",
    description: "Connect using Coinbase Wallet",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    name: "Trust Wallet",
    id: "trust",
    icon: "🛡️",
    description: "Connect using Trust Wallet mobile app",
    color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
  },
]

export const SOCIAL_PROVIDERS = [
  {
    name: "Google",
    id: "google",
    icon: "🔍",
    description: "Continue with your Google account",
    color: "bg-red-50 hover:bg-red-100 border-red-200",
  },
  {
    name: "Facebook",
    id: "facebook",
    icon: "📘",
    description: "Continue with your Facebook account",
    color: "bg-blue-50 hover:bg-blue-100 border-blue-200",
  },
  {
    name: "Twitter",
    id: "twitter",
    icon: "🐦",
    description: "Continue with your Twitter account",
    color: "bg-sky-50 hover:bg-sky-100 border-sky-200",
  },
  {
    name: "Discord",
    id: "discord",
    icon: "🎮",
    description: "Continue with your Discord account",
    color: "bg-indigo-50 hover:bg-indigo-100 border-indigo-200",
  },
  {
    name: "GitHub",
    id: "github",
    icon: "🐙",
    description: "Continue with your GitHub account",
    color: "bg-gray-50 hover:bg-gray-100 border-gray-200",
  },
  {
    name: "Email",
    id: "email_passwordless",
    icon: "📧",
    description: "Continue with your email address",
    color: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
  },
]
