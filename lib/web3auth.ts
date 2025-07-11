import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from "@web3auth/base";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

const clientId = "BBgJUg3TvBJ4hSMILiqLPqgByN9LzkcsFnYNynzOnp2h0D9KlgrIqPYNG8SDI2s0zhr4LzuH7v6qq1VnjVJgjJE";

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: "0x1", // Ethereum Mainnet
  rpcTarget: "https://rpc.ankr.com/eth",
  displayName: "Ethereum Mainnet",
  blockExplorerUrl: "https://etherscan.io/",
  ticker: "ETH",
  tickerName: "Ethereum",
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

export const web3authmodal = new Web3Auth({
  clientId,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET, // Use SAPPHIRE_MAINNET for production
  privateKeyProvider,
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
});

export const initweb3authmodal = async () => {
  try {
    await web3authmodal.initModal();
    return web3authmodal;
  } catch (error) {
    console.error("Error initializing web3authmodal:", error);
    throw error;
  }
};

export const connectweb3authmodal = async () => {
  try {
    if (!web3authmodal) {
      throw new Error("web3authmodal not initialized");
    }

    const provider = await web3authmodal.connect();
    return provider;
  } catch (error) {
    console.error("Error connecting to web3authmodal:", error);
    throw error;
  }
};

export const getUserInfo = async () => {
  try {
    if (!web3authmodal || !web3authmodal.connected) {
      return null;
    }

    const userInfo = await web3authmodal.getUserInfo();
    return userInfo;
  } catch (error) {
    console.error("Error getting user info:", error);
    return null;
  }
};

export const logout = async () => {
  try {
    if (!web3authmodal) return;
    await web3authmodal.logout();
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getProvider = () => {
  return web3authmodal?.provider || null;
};

export const isConnected = () => {
  return web3authmodal?.connected || false;
};
