import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { populateTestDonations } from "@/lib/test-donations"
import { DonationStorageManager } from "@/lib/donation-storage"

interface TestControlsProps {
  campaignId: string
  onDataUpdated?: () => void
}

export function TestControls({ campaignId, onDataUpdated }: TestControlsProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handlePopulateTest = async () => {
    setLoading(true)
    try {
      await populateTestDonations(campaignId)
      setMessage("✅ Test donations added successfully!")
      onDataUpdated?.()
    } catch (error) {
      setMessage("❌ Error adding test donations")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearData = async () => {
    setLoading(true)
    try {
      const manager = DonationStorageManager.getInstance()
      await manager.clearCampaignDonations(campaignId)
      setMessage("🗑️ All donation data cleared")
      onDataUpdated?.()
    } catch (error) {
      setMessage("❌ Error clearing data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          🧪 Demo Controls 
          <Badge variant="secondary" className="text-xs">Development Only</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-gray-600">
          Test the real-time donation tracking system
        </p>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            onClick={handlePopulateTest}
            disabled={loading}
            className="text-xs"
          >
            {loading ? "Adding..." : "Add Test Donations"}
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleClearData}
            disabled={loading}
            className="text-xs"
          >
            {loading ? "Clearing..." : "Clear All Data"}
          </Button>
        </div>
        {message && (
          <div className="text-xs p-2 rounded bg-white border">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}