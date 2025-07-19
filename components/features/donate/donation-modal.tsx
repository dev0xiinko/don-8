"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Heart, Wallet, AlertCircle, CheckCircle, Loader2, ExternalLink } from "lucide-react"
import { useWallet } from "@/contexts/WalletProvider"
import { useDonations } from "@/hooks/useDonations"
import {
  sendDonation,
  waitForTransaction,
  formatTransactionUrl,
  estimateGasFee,
  DonationError,
} from "@/lib/donation-util"
import type { NGO } from "@/hooks/useNGOs"

interface DonationModalProps {
  ngo: NGO
  isOpen: boolean
  onClose: () => void
}

type DonationStep = "form" | "confirm" | "processing" | "success" | "error"

export function DonationModal({ ngo, isOpen, onClose }: DonationModalProps) {
  const { walletInfo } = useWallet()
  const { addDonation, updateDonationStatus } = useDonations()

  const [step, setStep] = useState<DonationStep>("form")
  const [formData, setFormData] = useState({
    amount: "",
    message: "",
    anonymous: false,
  })
  const [gasEstimate, setGasEstimate] = useState("0.001")
  const [error, setError] = useState("")
  const [txHash, setTxHash] = useState("")
  const [donationId, setDonationId] = useState("")

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep("form")
      setFormData({ amount: "", message: "", anonymous: false })
      setError("")
      setTxHash("")
      setDonationId("")
      loadGasEstimate()
    }
  }, [isOpen])

  const loadGasEstimate = async () => {
    try {
      const estimate = await estimateGasFee()
      setGasEstimate(estimate)
    } catch (error) {
      console.error("Failed to estimate gas:", error)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const validateForm = (): boolean => {
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setError("Please enter a valid donation amount")
      return false
    }

    if (!walletInfo) {
      setError("Wallet not connected")
      return false
    }

    const amount = Number.parseFloat(formData.amount)
    const balance = Number.parseFloat(walletInfo.balance)
    const gas = Number.parseFloat(gasEstimate)

    if (amount + gas > balance) {
      setError("Insufficient balance for donation and gas fees")
      return false
    }

    return true
  }

  const handleNext = () => {
    if (step === "form") {
      if (validateForm()) {
        setStep("confirm")
      }
    } else if (step === "confirm") {
      processDonation()
    }
  }

  const processDonation = async () => {
    if (!walletInfo || walletInfo.walletType !== "metamask") {
      setError("Only MetaMask donations are supported currently")
      return
    }

    setStep("processing")
    setError("")

    try {
      // Add donation to local state
      const newDonationId = addDonation({
        ngoId: ngo.id,
        ngoName: ngo.name,
        amount: formData.amount,
        currency: "ETH",
        status: "pending",
        message: formData.message,
        anonymous: formData.anonymous,
      })
      setDonationId(newDonationId)

      // Send transaction
      const { txHash: transactionHash } = await sendDonation(walletInfo, ngo.walletAddress, formData.amount)
      setTxHash(transactionHash)

      // Update donation with tx hash
      updateDonationStatus(newDonationId, "pending", transactionHash)

      // Wait for confirmation
      await waitForTransaction(transactionHash)

      // Update donation status to completed
      updateDonationStatus(newDonationId, "completed", transactionHash)

      setStep("success")
    } catch (error: any) {
      console.error("Donation failed:", error)

      if (donationId) {
        updateDonationStatus(donationId, "failed")
      }

      if (error instanceof DonationError) {
        setError(error.message)
      } else {
        setError("Transaction failed. Please try again.")
      }

      setStep("error")
    }
  }

  const handleClose = () => {
    onClose()
    // Reset after animation
    setTimeout(() => {
      setStep("form")
      setFormData({ amount: "", message: "", anonymous: false })
      setError("")
      setTxHash("")
      setDonationId("")
    }, 300)
  }

  const progressPercentage = (ngo.totalRaised / ngo.goal) * 100

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span>Donate to {ngo.name}</span>
          </DialogTitle>
          <DialogDescription>Support this cause with a secure blockchain donation</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* NGO Info */}
          <Card>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>${ngo.totalRaised.toLocaleString()} raised</span>
                  <span>Goal: ${ngo.goal.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form Step */}
          {step === "form" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Donation Amount (ETH)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="amount"
                    type="number"
                    step="0.001"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleInputChange("amount", e.target.value)}
                    className="flex-1"
                  />
                </div>
                {formData.amount && (
                  <p className="text-xs text-gray-500">
                    ≈ ${(Number.parseFloat(formData.amount || "0") * 2500).toFixed(2)} USD
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "0.01")}>
                  0.01 ETH
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "0.05")}>
                  0.05 ETH
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleInputChange("amount", "0.1")}>
                  0.1 ETH
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Leave a message of support..."
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymous"
                  checked={formData.anonymous}
                  onCheckedChange={(checked) => handleInputChange("anonymous", checked as boolean)}
                />
                <Label htmlFor="anonymous" className="text-sm">
                  Donate anonymously
                </Label>
              </div>

              {walletInfo && (
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <div className="flex justify-between">
                    <span>Your balance:</span>
                    <span>{Number.parseFloat(walletInfo.balance).toFixed(4)} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. gas fee:</span>
                    <span>~{gasEstimate} ETH</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Confirmation Step */}
          {step === "confirm" && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Donation Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span>{formData.amount} ETH</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Est. gas fee:</span>
                    <span>~{gasEstimate} ETH</span>
                  </div>
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span>{(Number.parseFloat(formData.amount) + Number.parseFloat(gasEstimate)).toFixed(4)} ETH</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Recipient Wallet</Label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-mono break-all">{ngo.walletAddress}</p>
                </div>
              </div>

              {formData.message && (
                <div className="space-y-2">
                  <Label>Your Message</Label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">{formData.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Processing Step */}
          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-emerald-600" />
              <h4 className="text-lg font-semibold mb-2">Processing Donation</h4>
              <p className="text-sm text-gray-600 mb-4">
                {txHash ? "Waiting for blockchain confirmation..." : "Please confirm the transaction in your wallet"}
              </p>
              {txHash && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-xs mb-2">Transaction Hash:</p>
                  <p className="text-xs font-mono break-all">{txHash}</p>
                </div>
              )}
            </div>
          )}

          {/* Success Step */}
          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Donation Successful!</h4>
              <p className="text-sm text-gray-600 mb-4">
                Your donation of {formData.amount} ETH has been successfully sent to {ngo.name}.
              </p>
              {txHash && (
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs mb-1">Transaction Hash:</p>
                    <p className="text-xs font-mono break-all">{txHash}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(formatTransactionUrl(txHash), "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Etherscan
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Error Step */}
          {step === "error" && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">Donation Failed</h4>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => setStep("form")}>
                Try Again
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {step === "form" && (
              <>
                <Button variant="outline" onClick={handleClose} className="flex-1 bg-transparent">
                  Cancel
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  disabled={!formData.amount || Number.parseFloat(formData.amount) <= 0}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Continue
                </Button>
              </>
            )}

            {step === "confirm" && (
              <>
                <Button variant="outline" onClick={() => setStep("form")} className="flex-1">
                  Back
                </Button>
                <Button onClick={handleNext} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Wallet className="w-4 h-4 mr-2" />
                  Confirm Donation
                </Button>
              </>
            )}

            {step === "success" && (
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            )}

            {step === "processing" && (
              <Button variant="outline" onClick={handleClose} className="w-full bg-transparent">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
