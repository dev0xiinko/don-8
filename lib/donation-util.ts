import { ethers } from "ethers"

export interface DonationTransaction {
  to: string
  value: string
  data?: string
}

export class DonationError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "DonationError"
  }
}

export const createDonationTransaction = (recipientAddress: string, amount: string): DonationTransaction => {
  try {
    // Validate address
    if (!ethers.isAddress(recipientAddress)) {
      throw new DonationError("Invalid recipient address", "INVALID_ADDRESS")
    }

    // Validate amount
    const amountBN = ethers.parseEther(amount)
    if (amountBN <= 0) {
      throw new DonationError("Amount must be greater than 0", "INVALID_AMOUNT")
    }

    return {
      to: recipientAddress,
      value: amountBN.toString(),
    }
  } catch (error) {
    if (error instanceof DonationError) {
      throw error
    }
    throw new DonationError("Failed to create transaction", "TRANSACTION_ERROR")
  }
}

export const sendDonation = async (
  walletInfo: any,
  recipientAddress: string,
  amount: string,
): Promise<{ txHash: string; receipt?: any }> => {
  try {
    if (!walletInfo || walletInfo.walletType !== "metamask") {
      throw new DonationError("MetaMask wallet required for donations", "WALLET_NOT_SUPPORTED")
    }

    if (!window.ethereum) {
      throw new DonationError("MetaMask not found", "METAMASK_NOT_FOUND")
    }

    // Create provider and signer
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Validate balance
    const balance = await provider.getBalance(await signer.getAddress())
    const amountWei = ethers.parseEther(amount)
    const gasEstimate = ethers.parseEther("0.001") // Rough gas estimate

    if (balance < amountWei + gasEstimate) {
      throw new DonationError("Insufficient balance for transaction and gas", "INSUFFICIENT_BALANCE")
    }

    // Create and send transaction
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: amountWei,
    })

    return {
      txHash: tx.hash,
    }
  } catch (error: any) {
    console.error("Donation error:", error)

    if (error instanceof DonationError) {
      throw error
    }

    // Handle MetaMask errors
    if (error.code === 4001) {
      throw new DonationError("Transaction rejected by user", "USER_REJECTED")
    }

    if (error.code === -32603) {
      throw new DonationError("Transaction failed - insufficient funds or gas", "TRANSACTION_FAILED")
    }

    throw new DonationError(error.message || "Transaction failed", "UNKNOWN_ERROR")
  }
}

export const waitForTransaction = async (txHash: string): Promise<any> => {
  try {
    if (!window.ethereum) {
      throw new DonationError("MetaMask not found", "METAMASK_NOT_FOUND")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const receipt = await provider.waitForTransaction(txHash)

    if (!receipt) {
      throw new DonationError("Transaction not found", "TRANSACTION_NOT_FOUND")
    }

    if (receipt.status === 0) {
      throw new DonationError("Transaction failed", "TRANSACTION_FAILED")
    }

    return receipt
  } catch (error: any) {
    console.error("Transaction wait error:", error)
    throw new DonationError(error.message || "Failed to confirm transaction", "CONFIRMATION_ERROR")
  }
}

export const formatTransactionUrl = (txHash: string, network = "mainnet"): string => {
  const baseUrl = network === "mainnet" ? "https://etherscan.io" : `https://${network}.etherscan.io`
  return `${baseUrl}/tx/${txHash}`
}

export const estimateGasFee = async (): Promise<string> => {
  try {
    if (!window.ethereum) {
      return "0.001" // Default estimate
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const gasPrice = await provider.getFeeData()

    // Estimate for a simple transfer (21000 gas)
    const gasLimit = BigInt(21000)
    const estimatedFee = gasPrice.gasPrice ? gasPrice.gasPrice * gasLimit : ethers.parseEther("0.001")

    return ethers.formatEther(estimatedFee)
  } catch (error) {
    console.error("Gas estimation error:", error)
    return "0.001" // Fallback estimate
  }
}
