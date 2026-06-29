'use client';

import { Receipt as ReceiptIcon, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { Receipt } from '@/types';
import { KpiCard, KpiGrid } from '@/components/ui/kpi-card';
import { formatCurrency } from '@/lib/utils';

interface ReceiptSummaryBarProps {
  receipts: Receipt[];
}

export default function ReceiptSummaryBar({ receipts }: ReceiptSummaryBarProps) {
  const total = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const pending = receipts.filter((r) => !r.reimbursed).reduce((sum, r) => sum + r.total, 0);
  const reimbursed = receipts.filter((r) => r.reimbursed).reduce((sum, r) => sum + r.total, 0);

  return (
    <KpiGrid className="grid-cols-2 lg:grid-cols-4">
      <KpiCard label="Total receipts" value={total} icon={ReceiptIcon} />
      <KpiCard label="Total spent" value={formatCurrency(totalSpent)} icon={DollarSign} />
      <KpiCard label="Pending" value={formatCurrency(pending)} icon={Clock} tone="warning" />
      <KpiCard label="Reimbursed" value={formatCurrency(reimbursed)} icon={CheckCircle2} tone="success" />
    </KpiGrid>
  );
}
