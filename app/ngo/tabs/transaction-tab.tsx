"use client";

import { TransactionHistory } from "@/components/transaction-history";

interface TransactionsTabProps {
  transactions: any[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  return (
    <div className="space-y-6">
      <TransactionHistory transactions={transactions} />
    </div>
  );
}