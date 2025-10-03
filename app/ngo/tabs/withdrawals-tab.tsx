"use client";

import { WithdrawalHistory } from "@/components/withdrawal-history";

interface WithdrawalsTabProps {
  withdrawals: any[];
}

export function WithdrawalsTab({ withdrawals }: WithdrawalsTabProps) {
  return (
    <div className="space-y-6">
      <WithdrawalHistory withdrawals={withdrawals} />
    </div>
  );
}
