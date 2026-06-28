'use client';

import { Receipt as ReceiptIcon, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { Receipt } from '@/types';

interface ReceiptSummaryBarProps {
  receipts: Receipt[];
}

export default function ReceiptSummaryBar({ receipts }: ReceiptSummaryBarProps) {
  const total = receipts.length;
  const totalSpent = receipts.reduce((sum, r) => sum + r.total, 0);
  const pending = receipts.filter(r => !r.reimbursed).reduce((sum, r) => sum + r.total, 0);
  const reimbursed = receipts.filter(r => r.reimbursed).reduce((sum, r) => sum + r.total, 0);

  const fmt = (n: number) => `$${n.toFixed(2)}`;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: 'Total Receipts', value: String(total), icon: <ReceiptIcon className="w-5 h-5" />, color: '#FF7518' },
        { label: 'Total Spent', value: fmt(totalSpent), icon: <DollarSign className="w-5 h-5" />, color: '#8b95aa' },
        { label: 'Pending', value: fmt(pending), icon: <Clock className="w-5 h-5" />, color: '#facc15' },
        { label: 'Reimbursed', value: fmt(reimbursed), icon: <CheckCircle className="w-5 h-5" />, color: '#4ade80' },
      ].map(({ label, value, icon, color }) => (
        <div key={label} className="glass p-4 flex flex-col gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
            <span style={{ color }}>{icon}</span>
          </div>
          <div>
            <div className="text-xl font-bold" style={{ color: '#f0f4ff' }}>{value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#8b95aa' }}>{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
