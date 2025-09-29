import { ethers } from "ethers"
import EnhancedDonationPlatformABI from "./contracts/EnhancedDonationPlatform.json"

export interface DonationPlatformContract {
  donateETH: (ngoAddress: string, isAnonymous: boolean, amount: string) => Promise<ethers.TransactionResponse>
  donateToken: (tokenAddress: string, ngoAddress: string, amount: string, isAnonymous: boolean) => Promise<ethers.TransactionResponse>
  getNGOInfo: (ngoAddress: string) => Promise<{
    name: string
    isVerified: boolean
    isActive: boolean
    totalReceivedETH: bigint
    score: bigint
    lastReport: bigint
  }>
  getDonationCount: () => Promise<bigint>
}

export const getContractAddress = (chainId: string): string => {
  // Currently only deployed on Base Sepolia
  if (chainId === "84532") {
    return EnhancedDonationPlatformABI.address
  }
  throw new Error(`Contract not deployed on chain ID: ${chainId}`)
}

export const getEnhancedDonationPlatform = async (provider: ethers.BrowserProvider): Promise<DonationPlatformContract> => {
  const network = await provider.getNetwork()
  const chainId = network.chainId.toString()
  
  // Get contract address based on chainId
  const contractAddress = getContractAddress(chainId)
  
  // Get signer
  const signer = await provider.getSigner()
  
  // Create contract instance
  const contract = new ethers.Contract(
    contractAddress,
    EnhancedDonationPlatformABI.abi,
    signer
  )
  
  return {
    donateETH: async (ngoAddress: string, isAnonymous: boolean, amount: string) => {
      return await contract.donateETH(ngoAddress, isAnonymous, {
        value: ethers.parseEther(amount)
      })
    },
    
    donateToken: async (tokenAddress: string, ngoAddress: string, amount: string, isAnonymous: boolean) => {
      // For token donations, we need to approve the contract to spend tokens first
      // This would typically be handled separately before calling this function
      return await contract.donateToken(tokenAddress, ngoAddress, ethers.parseUnits(amount, 18), isAnonymous)
    },
    
    getNGOInfo: async (ngoAddress: string) => {
      return await contract.getNGOInfo(ngoAddress)
    },
    
    getDonationCount: async () => {
      return await contract.donationCount()
    }
  }
}

// Helper function to check if the current network is supported
export const isNetworkSupported = (chainId: string): boolean => {
  try {
    getContractAddress(chainId)
    return true
  } catch {
    return false
  }
}

// Helper function to get the required network name
export const getRequiredNetworkName = (): string => {
  return "Base Sepolia"
}