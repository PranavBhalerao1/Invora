'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Receipt } from '@/types';
import { Button } from '@/components/ui/button';

interface ReceiptDetailDrawerProps {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptDetailDrawer({ receipt, onClose }: ReceiptDetailDrawerProps) {
  const fmt = (n: number | null) => (n != null ? `$${n.toFixed(2)}` : '—');
  const fmtDate = (d: string | null) =>
    d
      ? new Date(d).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 38 }}
          className="relative bg-popover border border-border w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-2xl sm:rounded-xl shadow-xl shadow-black/40"
        >
          {/* Drag handle — mobile only */}
          <div className="sm:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-border" />
          </div>

          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-popover border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Receipt Detail</h2>
            <Button variant="ghost" size="icon-sm" onClick={onClose}>
              <X className="size-4" />
            </Button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Header info */}
            <div className="flex flex-col gap-1">
              <p className="text-lg font-semibold text-foreground">
                {receipt.vendor || 'Unknown vendor'}
              </p>
              <p className="text-sm text-muted-foreground">
                {fmtDate(receipt.receipt_date)} · Submitted by {receipt.submitted_by_name}
              </p>
              <span
                className={`self-start mt-1.5 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border ${
                  receipt.reimbursed
                    ? 'bg-success/10 text-success border-success/20'
                    : 'bg-warning/10 text-warning border-warning/20'
                }`}
              >
                {receipt.reimbursed ? 'Reimbursed' : 'Pending reimbursement'}
              </span>
            </div>

            {/* Image */}
            {receipt.image_url && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Receipt Image</p>
                <a
                  href={receipt.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative overflow-hidden rounded-xl group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt.image_url}
                    alt="Receipt"
                    className="w-full object-cover rounded-xl max-h-64"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center rounded-xl">
                    <ExternalLink className="size-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </div>
            )}

            {/* Line items */}
            {receipt.items && receipt.items.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Items</p>
                <div className="flex flex-col gap-1">
                  {receipt.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-muted"
                    >
                      <span className="text-sm text-foreground">{item.name}</span>
                      {item.quantity && item.quantity !== '1' && (
                        <span className="text-xs ml-3 shrink-0 px-2 py-0.5 rounded-md bg-accent text-accent-foreground font-medium">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-border bg-muted/50">
              <span className="text-sm font-medium text-foreground">Total</span>
              <span className="text-base font-bold text-primary tabular-nums">
                {fmt(receipt.total)}
              </span>
            </div>

            {/* Notes */}
            {receipt.notes && (
              <div className="px-3 py-2.5 rounded-lg bg-muted">
                <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                <p className="text-sm text-foreground leading-relaxed">{receipt.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
