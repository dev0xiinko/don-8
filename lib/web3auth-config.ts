import { Web3Auth } from "@web3auth/modal"
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base"
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider"
import { MetamaskAdapter } from "@web3auth/metamask-adapter"
import { WalletConnectV2Adapter, getWalletConnectV2Settings } from "@web3auth/wallet-connect-v2-adapter"

// SonicLabs Network Configuration
const sonicLabsChain = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x39", // 57 in decimal
  rpcTarget: "https://rpc.soniclabs.com",
  displayName: "SonicLabs Network",
  blockExplorerUrl: "https://explorer.soniclabs.com",
  ticker: "S",
  tickerName: "Sonic",
  logo: "https://cryptologos.cc/logos/sonic-s-logo.png",
}

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig: sonicLabsChain },
})

export const web3AuthConfig = {
  clientId: "BBgJUg3TvBJ4hSMILiqLPqgByN9LzkcsFnYNynzOnp2h0D9KlgrIqPYNG8SDI2s0zhr4LzuH7v6qq1VnjVJgjJE",
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Use SAPPHIRE_MAINNET for production
  chainConfig: sonicLabsChain,
  privateKeyProvider,
}

let web3auth: Web3Auth | null = null

export const initializeWeb3Auth = async (): Promise<Web3Auth> => {
  try {
    web3auth = new Web3Auth({
      clientId: web3AuthConfig.clientId,
      web3AuthNetwork: web3AuthConfig.web3AuthNetwork,
      privateKeyProvider: web3AuthConfig.privateKeyProvider,
      uiConfig: {
        appName: "DON-8",
        appUrl: "https://don8.app",
        logoLight: "https://don8.app/logo-light.png",
        logoDark: "https://don8.app/logo-dark.png",
        defaultLanguage: "en",
        mode: "auto",
        theme: {
          primary: "#10b981", // emerald-600
        },
      },
    })

    // Add MetaMask Adapter
    const metamaskAdapter = new MetamaskAdapter({
      clientId: web3AuthConfig.clientId,
      sessionTime: 86400, // 1 day
      web3AuthNetwork: web3AuthConfig.web3AuthNetwork,
      chainConfig: sonicLabsChain,
    })
    web3auth.configureAdapter(metamaskAdapter)

    // Add WalletConnect Adapter
    const defaultWcSettings = await getWalletConnectV2Settings(
      "eip155",
      ["1", "137", "57"], // Ethereum, Polygon, SonicLabs
      "04309ed1007e77d1f119b85205bb779d",
    )

    const walletConnectV2Adapter = new WalletConnectV2Adapter({
      adapterSettings: {
        qrcodeModal: defaultWcSettings.qrcodeModal,
        wcSettings: defaultWcSettings.wcSettings,
      },
      loginSettings: { mfaLevel: "default" },
      clientId: web3AuthConfig.clientId,
      web3AuthNetwork: web3AuthConfig.web3AuthNetwork,
      chainConfig: sonicLabsChain,
    })
    web3auth.configureAdapter(walletConnectV2Adapter)

    await web3auth.initModal()
    return web3auth
  } catch (error) {
    console.error("Error initializing Web3Auth:", error)
    throw error
  }
}

export const getWeb3Auth = (): Web3Auth | null => {
  return web3auth
}
