'use client';

import { Receipt as ReceiptIcon, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Receipt } from '@/types';
import { cn } from '@/lib/utils';

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
    {
      label: 'Total Receipts',
      value: String(total),
      icon: <ReceiptIcon className="size-5" />,
      color: undefined,
      iconClass: 'bg-accent text-primary',
    },
    {
      label: 'Total Spent',
      value: fmt(totalSpent),
      icon: <DollarSign className="size-5" />,
      color: undefined,
      iconClass: 'bg-accent text-primary',
    },
    {
      label: 'Pending',
      value: fmt(pending),
      icon: <Clock className="size-5" />,
      color: 'text-warning',
      iconClass: 'bg-warning/10 text-warning',
    },
    {
      label: 'Reimbursed',
      value: fmt(reimbursed),
      icon: <CheckCircle className="size-5" />,
      color: 'text-success',
      iconClass: 'bg-success/10 text-success',
    },
  ] as const;

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map(({ label, value, icon, color, iconClass }) => (
        <div key={label} className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                iconClass
              )}
            >
              {icon}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{label}</span>
          </div>
          <div className={cn('text-3xl font-bold tabular-nums', color ?? 'text-foreground')}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
