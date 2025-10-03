"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import { connectWallet, getBalance, shortenAddress } from "@/lib/metamask"

interface WalletConnectProps {
  onBalanceUpdate?: (balance: number) => void
}

export function WalletConnect({ onBalanceUpdate }: WalletConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    setIsConnecting(true)
    const address = await connectWallet()
    if (address) {
      setWalletAddress(address)
      const bal = await getBalance(address)
      setBalance(bal)
      onBalanceUpdate?.(bal)
    }
    setIsConnecting(false)
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0])
          getBalance(accounts[0]).then((bal) => {
            setBalance(bal)
            onBalanceUpdate?.(bal)
          })
        } else {
          setWalletAddress(null)
          setBalance(0)
          onBalanceUpdate?.(null as any)
        }
      })
    }
  }, [onBalanceUpdate])

  if (!walletAddress) {
    return (
      <Button onClick={handleConnect} disabled={isConnecting} className="gap-2">
        <Wallet className="h-4 w-4" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Connected Wallet</p>
          <p className="font-mono text-sm font-medium">{shortenAddress(walletAddress)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Balance</p>
          <p className="text-lg font-bold">{balance.toFixed(4)} ETH</p>
        </div>
      </div>
    </Card>
  )
}
