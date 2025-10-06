"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Transaction } from "@/lib/mock-data"
import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react"

interface TransactionHistoryProps {
  transactions: Transaction[]
}

export function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "donation":
        return <ArrowDownCircle className="h-5 w-5 text-green-500" />
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-500" />
      case "expense":
        return <DollarSign className="h-5 w-5 text-orange-500" />
    }
  }

  const getTransactionColor = (type: Transaction["type"]) => {
    switch (type) {
      case "donation":
        return "text-green-600 dark:text-green-400"
      case "withdrawal":
        return "text-red-600 dark:text-red-400"
      case "expense":
        return "text-orange-600 dark:text-orange-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Complete record of all donations, expenses, and withdrawals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between gap-4 rounded-lg border p-4">
              <div className="flex items-center gap-4">
                {getTransactionIcon(transaction.type)}
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="font-mono text-xs">{(transaction.txHash || '').slice(0, 10)}...</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
                  {transaction.type === "donation" ? "+" : "-"}
                  {transaction.amount.toFixed(2)} SONIC
                </p>
                <Badge variant="outline" className="capitalize">
                  {transaction.type}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
