"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Withdrawal } from "@/lib/mock-data"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

interface WithdrawalHistoryProps {
  withdrawals: Withdrawal[]
}

export function WithdrawalHistory({ withdrawals }: WithdrawalHistoryProps) {
  const getStatusConfig = (status: Withdrawal["status"]) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle2,
          label: "Completed",
          className: "bg-green-500 text-white",
        }
      case "pending":
        return {
          icon: Clock,
          label: "Pending",
          className: "bg-yellow-500 text-white",
        }
      case "failed":
        return {
          icon: XCircle,
          label: "Failed",
          className: "bg-red-500 text-white",
        }
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal History</CardTitle>
        <CardDescription>Track all fund withdrawals and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {withdrawals.map((withdrawal) => {
            const statusConfig = getStatusConfig(withdrawal.status)
            const StatusIcon = statusConfig.icon

            return (
              <div key={withdrawal.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="font-medium text-lg">{withdrawal.amount.toFixed(4)} SONIC</p>
                    <Badge className={statusConfig.className}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">To:</span>{" "}
                      <span className="font-mono">
                        {withdrawal.destination.slice(0, 10)}...{withdrawal.destination.slice(-8)}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Date:</span> {new Date(withdrawal.date).toLocaleDateString()}
                    </p>
                    {withdrawal.txHash && (
                      <p>
                        <span className="font-medium">Tx Hash:</span>{" "}
                        <span className="font-mono text-xs">{withdrawal.txHash.slice(0, 16)}...</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
