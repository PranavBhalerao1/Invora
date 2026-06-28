'use client';

import { Receipt as ReceiptIcon, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Receipt } from '@/types';

interface ReceiptSummaryBarProps {
  receipts: Receipt[];
}

export default function ReceiptSummaryBar({ receipts }: ReceiptSummaryBarProps) {
  const total = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const pending = receipts.filter((r) => !r.reimbursed).reduce((sum, r) => sum + r.total, 0);
  const reimbursed = receipts.filter((r) => r.reimbursed).reduce((sum, r) => sum + r.total, 0);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  const stats = [
    { label: 'Total Receipts', value: String(total), icon: <ReceiptIcon className="size-4" />, color: undefined },
    { label: 'Total Spent', value: fmt(totalSpent), icon: <DollarSign className="size-4" />, color: undefined },
    { label: 'Pending', value: fmt(pending), icon: <Clock className="size-4" />, color: 'text-warning' },
    { label: 'Reimbursed', value: fmt(reimbursed), icon: <CheckCircle className="size-4" />, color: 'text-success' },
  ] as const;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon, color }) => (
        <div key={label} className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              {label}
            </span>
            <span className="text-muted-foreground/50 [&_svg]:size-4">{icon}</span>
          </div>
          <div className={`text-2xl font-bold tabular-nums ${color ?? 'text-foreground'}`}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
