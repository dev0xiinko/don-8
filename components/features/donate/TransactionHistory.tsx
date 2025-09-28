"use client"

import { useState, useEffect } from "react"
import { Heart, ExternalLink } from "lucide-react"
import Link from "next/link"

interface Transaction {
  id: string
  donorName: string | null // null for anonymous donations
  walletAddress: string
  amount: number
  timestamp: Date
  isAnonymous: boolean
}

interface TransactionHistoryProps {
  campaignId: string
}

export default function TransactionHistory({ campaignId }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    // Mock transaction data
    const mockTransactions: Transaction[] = [
      {
        id: "tx1",
        donorName: "Adrian Alquizar",
        walletAddress: "0x1234567890abcdef",
        amount: 0.5,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        isAnonymous: false
      },
      {
        id: "tx2",
        donorName: null,
        walletAddress: "0x0987654321fedcba",
        amount: 1.2,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isAnonymous: true
      },
      {
        id: "tx3",
        donorName: "Maria Santos",
        walletAddress: "0xabcdef1234567890",
        amount: 0.8,
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        isAnonymous: false
      }
    ]
    
    setTransactions(mockTransactions)
  }, [campaignId])

  // Function to add a new transaction
  const addTransaction = (transaction: Transaction) => {
    setTransactions(prev => [transaction, ...prev])
  }

  // Format the time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    
    let interval = seconds / 31536000
    if (interval > 1) return Math.floor(interval) + " years ago"
    
    interval = seconds / 2592000
    if (interval > 1) return Math.floor(interval) + " months ago"
    
    interval = seconds / 86400
    if (interval > 1) return Math.floor(interval) + " days ago"
    
    interval = seconds / 3600
    if (interval > 1) return Math.floor(interval) + " hours ago"
    
    interval = seconds / 60
    if (interval > 1) return Math.floor(interval) + " minutes ago"
    
    return Math.floor(seconds) + " seconds ago"
  }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Heart className="w-4 h-4 text-red-500" />
            </div>
            <div>
              {/* Display donor name based on anonymity preference */}
              <p className="font-medium">
                {tx.isAnonymous ? "Anonymous Donor" : (tx.donorName || "Unknown Donor")}
              </p>
              <p className="text-xs text-gray-500">{formatTimeAgo(tx.timestamp)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-medium">{tx.amount} ETH</p>
            <div className="flex items-center justify-end space-x-1">
              <p className="text-xs text-gray-500">
                Transaction: {tx.walletAddress.substring(0, 6)}...{tx.walletAddress.substring(tx.walletAddress.length - 4)}
              </p>
              <Link 
                href={`https://etherscan.io/tx/${tx.id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}