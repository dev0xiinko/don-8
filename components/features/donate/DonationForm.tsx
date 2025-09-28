"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/contexts/WalletProvider"

interface DonationFormProps {
  campaignId: string
  campaignTitle: string
  onDonationComplete?: (amount: number, isAnonymous: boolean, message: string) => void
}

export default function DonationForm({ campaignId, campaignTitle, onDonationComplete }: DonationFormProps) {
  const [amount, setAmount] = useState<string>("")
  const [message, setMessage] = useState<string>("")
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const { isConnected, connect } = useWallet()

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount")
      return
    }

    setIsSubmitting(true)
    
    try {
      // If wallet is not connected, connect first
      if (!isConnected) {
        await connect()
      }
      
      // Mock donation process
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Call the callback with donation details
      if (onDonationComplete) {
        onDonationComplete(parseFloat(amount), isAnonymous, message)
      }
      
      // Reset form
      setAmount("")
      setMessage("")
      setIsAnonymous(false)
      
      alert("Donation successful! Thank you for your contribution.")
    } catch (error) {
      console.error("Donation failed:", error)
      alert("Donation failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold mb-4">Donate to {campaignTitle}</h3>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full"
              min="0"
              step="0.01"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Add a message (optional)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full"
              rows={3}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked === true)}
            />
            <label
              htmlFor="anonymous"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Donate Anonymously
            </label>
          </div>
          
          <Button
            onClick={handleDonate}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : isConnected ? "Donate Now" : "Connect Wallet/Donate"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}