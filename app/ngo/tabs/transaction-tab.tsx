"use client";

import { TransactionHistory } from "@/components/transaction-history";
import { useEffect, useState } from "react";
import type { Transaction } from "@/lib/mock-data";

interface TransactionsTabProps {
  transactions: any[];
}

export function TransactionsTab({ transactions }: TransactionsTabProps) {
  const [liveTransactions, setLiveTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    // Start with any provided transactions
    if (transactions && transactions.length > 0) {
      setLiveTransactions(transactions as Transaction[]);
    }
    const ngoInfoRaw = typeof window !== 'undefined' ? sessionStorage.getItem('ngo_info') : null;
    const ngoInfo = ngoInfoRaw ? JSON.parse(ngoInfoRaw) : null;
    const ngoId = ngoInfo?.id || ngoInfo?.ngoId;
    if (!ngoId) return;

    const fetchTx = async () => {
      try {
        const res = await fetch(`/api/ngo/transactions?ngoId=${ngoId}`);
        const result = await res.json();
        if (result.success && Array.isArray(result.transactions)) {
          // Map to Transaction shape expected by component
          const mapped: Transaction[] = result.transactions.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount) || 0,
            description: t.description,
            date: t.date,
            txHash: t.txHash || t.id,
          }));
          setLiveTransactions(mapped);
        }
      } catch (e) {
        // ignore
      }
    };
    fetchTx();
  }, [transactions]);

  return (
    <div className="space-y-6">
      <TransactionHistory transactions={liveTransactions} />
    </div>
  );
}