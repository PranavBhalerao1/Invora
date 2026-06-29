'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, ReceiptText, SearchX } from 'lucide-react';
import { Receipt } from '@/types';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SearchBar } from '@/components/ui/search-bar';
import { Select } from '@/components/ui/select';
import { ReceiptStatusPill } from '@/components/ui/status-pill';
import { Table, TD, TH, THead, TR, SortHeader, type SortDir } from '@/components/ui/table';
import { formatCurrency, formatDate } from '@/lib/utils';
import ReimburseButton from './ReimburseButton';
import ReceiptDetailDrawer from './ReceiptDetailDrawer';

interface ReceiptTableProps {
  receipts: Receipt[];
  isAdmin: boolean;
  onReimbursed: (id: string) => void;
}

type SortKey = 'date' | 'vendor' | 'total' | 'status';

const statusOptions = [
  { value: 'all', label: 'All receipts' },
  { value: 'pending', label: 'Pending' },
  { value: 'reimbursed', label: 'Reimbursed' },
];

const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'total', label: 'Amount' },
  { value: 'status', label: 'Status' },
];

export default function ReceiptTable({ receipts, isAdmin, onReimbursed }: ReceiptTableProps) {
  const [selected, setSelected] = React.useState<Receipt | null>(null);
  const [query, setQuery] = React.useState('');
  const [status, setStatus] = React.useState('all');
  const [sortKey, setSortKey] = React.useState<SortKey>('date');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  const filtered = React.useMemo(() => {
    const next = receipts.filter((r) => {
      const matchesQuery =
        (r.vendor ?? '').toLowerCase().includes(query.toLowerCase()) ||
        r.submitted_by_name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        status === 'all' ||
        (status === 'reimbursed' ? r.reimbursed : !r.reimbursed);
      return matchesQuery && matchesStatus;
    });

    next.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') {
        cmp = new Date(a.receipt_date ?? a.created_at).getTime() - new Date(b.receipt_date ?? b.created_at).getTime();
      } else if (sortKey === 'vendor') cmp = (a.vendor ?? '').localeCompare(b.vendor ?? '');
      else if (sortKey === 'total') cmp = a.total - b.total;
      else cmp = Number(a.reimbursed) - Number(b.reimbursed);
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return next;
  }, [receipts, query, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir(key === 'date' || key === 'total' ? 'desc' : 'asc');
    }
  }

  const hasReceipts = receipts.length > 0;

  return (
    <>
      <div className="rounded-2xl border border-line bg-elevated shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search vendor or submitter..."
            className="sm:w-72"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Select value={status} onChange={setStatus} options={statusOptions} />
            <span className="hidden h-5 w-px bg-line sm:block" />
            <Select
              value={sortKey}
              onChange={(v) => setSortKey(v as SortKey)}
              options={sortOptions}
              label="Sort:"
              align="right"
            />
          </div>
        </div>

        {!hasReceipts ? (
          <EmptyState
            icon={ReceiptText}
            title="No receipts yet"
            description="Submit the first receipt with the button below. Scanned items are matched against your inventory automatically."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No receipts found"
            description="No receipts match the current search and filters."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                }}
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Table>
                <THead>
                  <TR className="hover:bg-transparent">
                    <SortHeader label="Vendor" active={sortKey === 'vendor'} dir={sortDir} onClick={() => toggleSort('vendor')} />
                    <TH>Submitted by</TH>
                    <SortHeader label="Date" active={sortKey === 'date'} dir={sortDir} onClick={() => toggleSort('date')} />
                    <TH>Items</TH>
                    <SortHeader label="Status" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
                    <SortHeader label="Amount" active={sortKey === 'total'} dir={sortDir} align="right" onClick={() => toggleSort('total')} />
                    <TH className="text-right">Action</TH>
                  </TR>
                </THead>
                <tbody>
                  {filtered.map((r) => (
                    <TR key={r.id} className="group">
                      <TD>
                        <button
                          onClick={() => setSelected(r)}
                          className="text-left font-medium text-ink transition-colors hover:text-accent"
                        >
                          {r.vendor || 'Unknown vendor'}
                        </button>
                        <div className="text-xs text-faint">
                          {r.items?.length ?? 0} line item{(r.items?.length ?? 0) !== 1 ? 's' : ''}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2">
                          <Avatar name={r.submitted_by_name} size="xs" ring={false} />
                          <span className="text-[13px] text-muted">{r.submitted_by_name}</span>
                        </div>
                      </TD>
                      <TD className="text-[13px] text-muted">{r.receipt_date ? formatDate(r.receipt_date) : '—'}</TD>
                      <TD className="text-[13px] tabular text-muted">{r.items?.length ?? 0}</TD>
                      <TD>
                        <ReceiptStatusPill reimbursed={r.reimbursed} />
                      </TD>
                      <TD className="text-right font-medium tabular text-ink">{formatCurrency(r.total)}</TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button size="sm" variant="subtle" onClick={() => setSelected(r)}>
                            View
                          </Button>
                          {isAdmin && !r.reimbursed && (
                            <ReimburseButton receiptId={r.id} onReimbursed={onReimbursed} />
                          )}
                        </div>
                      </TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-line md:hidden">
              <AnimatePresence initial={false}>
                {filtered.map((r) => (
                  <motion.div key={r.id} layout className="p-4">
                    <button
                      onClick={() => setSelected(r)}
                      className="flex w-full items-start justify-between gap-3 text-left"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium text-ink">{r.vendor || 'Unknown vendor'}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-faint">
                          <span>{r.receipt_date ? formatDate(r.receipt_date) : '—'}</span>
                          <span className="size-1 rounded-full bg-line-strong" />
                          <span>{r.submitted_by_name}</span>
                        </div>
                      </div>
                      <span className="shrink-0 font-semibold tabular text-ink">{formatCurrency(r.total)}</span>
                    </button>
                    <div className="mt-3 flex items-center justify-between">
                      <ReceiptStatusPill reimbursed={r.reimbursed} />
                      <div className="flex items-center gap-2">
                        {isAdmin && !r.reimbursed && (
                          <ReimburseButton receiptId={r.id} onReimbursed={onReimbursed} />
                        )}
                        <ChevronRight className="size-4 shrink-0 text-faint" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Footer summary */}
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-faint">
              <span className="inline-flex items-center gap-1.5">
                <ReceiptText className="size-3.5" />
                Showing {filtered.length} of {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </>
        )}
      </div>

      <ReceiptDetailDrawer
        receipt={selected}
        isAdmin={isAdmin}
        onReimbursed={onReimbursed}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
