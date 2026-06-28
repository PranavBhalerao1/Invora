'use client';

import { useState } from 'react';
import { Eye, ChevronRight, Receipt as ReceiptIcon } from 'lucide-react';
import { Receipt } from '@/types';
import { Button } from '@/components/ui/button';
import ReimburseButton from './ReimburseButton';
import ReceiptDetailDrawer from './ReceiptDetailDrawer';

interface ReceiptTableProps {
  receipts: Receipt[];
  isAdmin: boolean;
  onReimbursed: (id: string) => void;
}

function StatusPill({ reimbursed }: { reimbursed: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
        reimbursed
          ? 'bg-success/10 text-success border-success/20'
          : 'bg-warning/10 text-warning border-warning/20'
      }`}
    >
      {reimbursed ? 'Reimbursed' : 'Pending'}
    </span>
  );
}

export default function ReceiptTable({ receipts, isAdmin, onReimbursed }: ReceiptTableProps) {
  const [selected, setSelected] = useState<Receipt | null>(null);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  if (receipts.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 text-center gap-2">
        <ReceiptIcon className="size-8 text-muted-foreground/30 mb-1" />
        <p className="text-sm font-medium text-muted-foreground">No receipts yet</p>
        <p className="text-xs text-muted-foreground/60">
          Submit the first receipt using the button below
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {['Submitted By', 'Vendor', 'Date', 'Total', 'Items', 'Status', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide uppercase"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr
                key={r.id}
                className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelected(r)}
              >
                <td className="px-4 py-3.5 font-medium text-foreground">{r.submitted_by_name}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{r.vendor || '—'}</td>
                <td className="px-4 py-3.5 text-muted-foreground">{fmtDate(r.receipt_date)}</td>
                <td className="px-4 py-3.5 font-semibold text-foreground tabular-nums">
                  ${r.total.toFixed(2)}
                </td>
                <td className="px-4 py-3.5 text-muted-foreground tabular-nums">
                  {r.items?.length ?? 0}
                </td>
                <td className="px-4 py-3.5">
                  <StatusPill reimbursed={r.reimbursed} />
                </td>
                <td
                  className="px-4 py-3.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setSelected(r)}
                      aria-label="View receipt"
                    >
                      <Eye className="size-3.5 text-primary" />
                    </Button>
                    {isAdmin && !r.reimbursed && (
                      <ReimburseButton receiptId={r.id} onReimbursed={onReimbursed} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-2">
        {receipts.map((r) => (
          <div
            key={r.id}
            className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:bg-muted/20 transition-colors"
            onClick={() => setSelected(r)}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-medium text-sm text-foreground">{r.submitted_by_name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {r.vendor || 'Unknown vendor'} · {fmtDate(r.receipt_date)}
                </p>
              </div>
              <StatusPill reimbursed={r.reimbursed} />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-foreground tabular-nums">
                ${r.total.toFixed(2)}
              </p>
              <div className="flex items-center gap-2">
                <div onClick={(e) => e.stopPropagation()}>
                  {isAdmin && !r.reimbursed && (
                    <ReimburseButton receiptId={r.id} onReimbursed={onReimbursed} />
                  )}
                </div>
                <ChevronRight className="size-4 text-muted-foreground/50 shrink-0" />
              </div>
            </div>
            {r.items && r.items.length > 0 && (
              <p className="text-xs mt-2 text-muted-foreground/60">
                {r.items.length} line item{r.items.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        ))}
      </div>

      {selected && (
        <ReceiptDetailDrawer receipt={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
