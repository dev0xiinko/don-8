"use client"

import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"

const clientId = "BBgJUg3TvBJ4hSMILiqLPqgByN9LzkcsFnYNynzOnp2h0D9KlgrIqPYNG8SDI2s0zhr4LzuH7v6qq1VnjVJgjJE"

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1",
  rpcTarget: "https://rpc.ankr.com/eth",
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
}

let web3auth: Web3Auth | null = null

export const initWeb3Auth = async () => {
  try {
    if (web3auth) {
      return web3auth
    }

    const privateKeyProvider = new EthereumPrivateKeyProvider({
      config: { chainConfig },
    })

    web3auth = new Web3Auth({
      clientId,
      web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
      privateKeyProvider,
      uiConfig: {
        appName: "DON-8",
        theme: {
          primary: "#10b981",
        },
      },
    })

    await web3auth.initModal()
    return web3auth
  } catch (error) {
    console.error("Error initializing Web3Auth:", error)
    throw error
  }
}

export const getWeb3Auth = () => {
  return web3auth
}

export const connectWeb3Auth = async () => {
  if (!web3auth) {
    throw new Error("Web3Auth not initialized")
  }

  try {
    const provider = await web3auth.connect()
    return provider
  } catch (error) {
    console.error("Error connecting:", error)
    throw error
  }
}

export const disconnectWeb3Auth = async () => {
  if (!web3auth) {
    return
  }

  try {
    await web3auth.logout()
  } catch (error) {
    console.error("Error disconnecting:", error)
    throw error
  }
}

export const getUserInfo = async () => {
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

export const isConnected = () => {
  return web3auth?.connected || false
}

export const getProvider = () => {
  return web3auth?.provider || null
}
