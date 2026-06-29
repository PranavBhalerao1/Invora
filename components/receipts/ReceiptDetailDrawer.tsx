'use client';

import { ExternalLink, ReceiptText, CalendarDays, UserRound } from 'lucide-react';
import { Receipt } from '@/types';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerBody, DrawerFooter, DrawerHeader } from '@/components/ui/drawer';
import { ReceiptStatusPill } from '@/components/ui/status-pill';
import { formatCurrency, formatDate } from '@/lib/utils';
import ReimburseButton from './ReimburseButton';

interface ReceiptDetailDrawerProps {
  receipt: Receipt | null;
  isAdmin: boolean;
  onReimbursed: (id: string) => void;
  onClose: () => void;
}

export default function ReceiptDetailDrawer({
  receipt,
  isAdmin,
  onReimbursed,
  onClose,
}: ReceiptDetailDrawerProps) {
  return (
    <Drawer open={Boolean(receipt)} onClose={onClose}>
      {receipt && (
        <>
          <DrawerHeader onClose={onClose}>
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl border border-line bg-subtle text-accent">
                <ReceiptText className="size-5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold tracking-tight text-ink">
                  {receipt.vendor || 'Unknown vendor'}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {receipt.receipt_date ? formatDate(receipt.receipt_date, true) : 'No date'} · Submitted by{' '}
                  {receipt.submitted_by_name}
                </p>
              </div>
            </div>
          </DrawerHeader>

          <DrawerBody className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-elevated p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-faint">
                  <CalendarDays className="size-3.5" />
                  Receipt total
                </div>
                <p className="mt-2 text-xl font-semibold tracking-tight text-ink tabular">
                  {formatCurrency(receipt.total)}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-elevated p-4">
                <div className="flex items-center gap-2 text-xs font-medium text-faint">
                  <UserRound className="size-3.5" />
                  Status
                </div>
                <div className="mt-2.5">
                  <ReceiptStatusPill reimbursed={receipt.reimbursed} />
                </div>
              </div>
            </div>

            {/* Image */}
            {receipt.image_url && (
              <div>
                <p className="mb-2 text-sm font-semibold text-ink">Receipt image</p>
                <a
                  href={receipt.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block overflow-hidden rounded-xl border border-line"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt.image_url}
                    alt="Receipt"
                    className="max-h-64 w-full rounded-xl object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors group-hover:bg-ink/30">
                    <ExternalLink className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </a>
              </div>
            )}

            {/* Line items */}
            {receipt.items && receipt.items.length > 0 && (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-ink">Line items</h3>
                  <span className="text-xs text-faint">{receipt.items.length} items</span>
                </div>
                <div className="overflow-hidden rounded-xl border border-line">
                  {receipt.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between border-b border-line px-3.5 py-3 text-sm last:border-0"
                    >
                      <span className="font-medium text-ink-soft">{item.name}</span>
                      {item.quantity && item.quantity !== '1' && (
                        <span className="ml-3 shrink-0 rounded-md bg-subtle px-2 py-0.5 text-xs font-medium text-muted">
                          ×{item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {receipt.notes && (
              <div className="rounded-xl border border-line bg-surface p-4">
                <p className="text-sm font-semibold text-ink">Notes</p>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{receipt.notes}</p>
              </div>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Close
            </Button>
            {isAdmin && !receipt.reimbursed && (
              <ReimburseButton
                receiptId={receipt.id}
                onReimbursed={(id) => {
                  onReimbursed(id);
                  onClose();
                }}
              />
            )}
          </DrawerFooter>
        </>
      )}
    </Drawer>
  );
}
