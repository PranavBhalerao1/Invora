'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Pencil, Trash2, PackageOpen, SearchX, Package } from 'lucide-react';
import { InventoryItem, Category, Status, CATEGORIES } from '@/types/inventory';
import { SearchBar } from '@/components/ui/search-bar';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StatusPill } from '@/components/ui/status-pill';
import { Progress } from '@/components/ui/progress';
import { EmptyState } from '@/components/ui/empty-state';
import { Table, THead, TR, TD, TH, SortHeader, type SortDir } from '@/components/ui/table';
import { relativeTime, clamp } from '@/lib/utils';

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateArrived: (id: string, arrived: number) => void;
}

type SortKey = 'name' | 'progress' | 'status' | 'updated';
const statusRank: Record<Status, number> = { pending: 0, partial: 1, arrived: 2 };

const categoryOptions = [
  { value: 'All', label: 'All categories' },
  ...CATEGORIES.map((c) => ({ value: c, label: c })),
];
const statusOptions = [
  { value: 'All', label: 'All status' },
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'arrived', label: 'Arrived' },
];
const sortOptions = [
  { value: 'status', label: 'Urgency' },
  { value: 'name', label: 'Name' },
  { value: 'progress', label: 'Progress' },
  { value: 'updated', label: 'Last updated' },
];

function progressTone(status: Status) {
  if (status === 'arrived') return 'success' as const;
  if (status === 'partial') return 'warning' as const;
  return 'neutral' as const;
}

export default function InventoryTable({
  items,
  isAdmin,
  onEdit,
  onDelete,
  onUpdateArrived,
}: InventoryTableProps) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<Category | 'All'>('All');
  const [status, setStatus] = React.useState<Status | 'All'>('All');
  const [sortKey, setSortKey] = React.useState<SortKey>('status');
  const [sortDir, setSortDir] = React.useState<SortDir>('asc');

  const filtered = React.useMemo(() => {
    const result = items.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        (item.assignedTo ?? '').toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'All' || item.category === category;
      const matchesStatus = status === 'All' || item.status === status;
      return matchesQuery && matchesCategory && matchesStatus;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'progress') {
        const pa = a.needed > 0 ? a.arrived / a.needed : 0;
        const pb = b.needed > 0 ? b.arrived / b.needed : 0;
        cmp = pa - pb;
      } else if (sortKey === 'status') cmp = statusRank[a.status] - statusRank[b.status];
      else cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [items, query, category, status, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const hasItems = items.length > 0;
  const filtersActive = query !== '' || category !== 'All' || status !== 'All';

  return (
    <div className="rounded-2xl border border-line bg-elevated shadow-card">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Search items or assignee..."
          className="sm:w-64"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Select value={category} onChange={(v) => setCategory(v as Category | 'All')} options={categoryOptions} />
          <Select value={status} onChange={(v) => setStatus(v as Status | 'All')} options={statusOptions} />
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

      {!hasItems ? (
        <EmptyState
          icon={PackageOpen}
          title="No inventory items yet"
          description="Start tracking what this camp needs. Use the + button to add the first item and watch arrivals come in."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No matching items"
          description="No items match your current search and filters."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQuery('');
                setCategory('All');
                setStatus('All');
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
                  <SortHeader label="Item" active={sortKey === 'name'} dir={sortDir} onClick={() => toggleSort('name')} />
                  <TH>Amount</TH>
                  <SortHeader label="Progress" active={sortKey === 'progress'} dir={sortDir} onClick={() => toggleSort('progress')} className="w-[26%]" />
                  <SortHeader label="Status" active={sortKey === 'status'} dir={sortDir} onClick={() => toggleSort('status')} />
                  <TH>Assigned</TH>
                  <SortHeader label="Updated" active={sortKey === 'updated'} dir={sortDir} onClick={() => toggleSort('updated')} />
                  <TH className="text-right">Arrived</TH>
                </TR>
              </THead>
              <tbody>
                {filtered.map((item) => {
                  const pct = clamp(item.needed > 0 ? (item.arrived / item.needed) * 100 : 0, 0, 100);
                  return (
                    <TR key={item.id} className="group">
                      <TD>
                        <div className="font-medium text-ink">{item.name}</div>
                        <div className="text-xs text-faint">{item.category}</div>
                      </TD>
                      <TD className="text-[13px] text-muted whitespace-nowrap">{item.totalAmount}</TD>
                      <TD>
                        <div className="flex items-center gap-3">
                          <span className="w-12 shrink-0 text-[13px] tabular text-ink-soft">
                            {item.arrived}
                            <span className="text-faint"> / {item.needed}</span>
                          </span>
                          <Progress value={pct} tone={progressTone(item.status)} className="max-w-32" />
                        </div>
                      </TD>
                      <TD>
                        <StatusPill status={item.status} />
                      </TD>
                      <TD className="text-[13px] text-muted">{item.assignedTo ?? '—'}</TD>
                      <TD>
                        <span className="text-xs text-faint">{relativeTime(item.updatedAt)}</span>
                      </TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1">
                          <ArrivedStepper
                            value={item.arrived}
                            max={item.needed}
                            onDec={() => onUpdateArrived(item.id, Math.max(0, item.arrived - 1))}
                            onInc={() => onUpdateArrived(item.id, Math.min(item.needed, item.arrived + 1))}
                          />
                          <button
                            onClick={() => onEdit(item)}
                            aria-label={`Edit ${item.name}`}
                            className="ml-1 flex size-7 items-center justify-center rounded-md text-faint transition-all hover:bg-subtle hover:text-ink"
                          >
                            <Pencil className="size-3.5" />
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => onDelete(item)}
                              aria-label={`Delete ${item.name}`}
                              className="flex size-7 items-center justify-center rounded-md text-faint opacity-0 transition-all hover:bg-danger-soft hover:text-danger group-hover:opacity-100"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-line md:hidden">
            <AnimatePresence initial={false}>
              {filtered.map((item) => {
                const pct = clamp(item.needed > 0 ? (item.arrived / item.needed) * 100 : 0, 0, 100);
                return (
                  <motion.div key={item.id} layout exit={{ opacity: 0, height: 0 }} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-ink">{item.name}</span>
                          <StatusPill status={item.status} />
                        </div>
                        <div className="mt-0.5 text-xs text-faint">
                          {item.category} · {item.totalAmount}
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => onEdit(item)}
                          aria-label="Edit"
                          className="flex size-7 items-center justify-center rounded-md text-faint hover:bg-subtle hover:text-ink"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => onDelete(item)}
                            aria-label="Delete"
                            className="flex size-7 items-center justify-center rounded-md text-faint hover:bg-danger-soft hover:text-danger"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <ArrivedStepper
                        value={item.arrived}
                        max={item.needed}
                        onDec={() => onUpdateArrived(item.id, Math.max(0, item.arrived - 1))}
                        onInc={() => onUpdateArrived(item.id, Math.min(item.needed, item.arrived + 1))}
                      />
                      <Progress value={pct} tone={progressTone(item.status)} />
                      <span className="shrink-0 text-[12px] tabular text-muted">
                        {item.arrived}
                        <span className="text-faint"> / {item.needed}</span>
                      </span>
                    </div>
                    {item.assignedTo && (
                      <p className="mt-2.5 text-xs text-faint">Assigned: {item.assignedTo}</p>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Footer summary */}
          <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-xs text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" />
              Showing {filtered.length} of {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
            {filtersActive && <span className="text-muted">Filters applied</span>}
          </div>
        </>
      )}
    </div>
  );
}

function ArrivedStepper({
  value,
  max,
  onDec,
  onInc,
}: {
  value: number;
  max: number;
  onDec: () => void;
  onInc: () => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line-strong bg-elevated shadow-xs">
      <button
        onClick={onDec}
        disabled={value <= 0}
        aria-label="Decrease arrived"
        className="flex size-7 items-center justify-center rounded-l-lg text-muted transition-colors hover:bg-subtle hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="flex w-8 items-center justify-center border-x border-line text-[13px] font-medium tabular text-ink">
        {value}
      </span>
      <button
        onClick={onInc}
        disabled={value >= max}
        aria-label="Increase arrived"
        className="flex size-7 items-center justify-center rounded-r-lg text-muted transition-colors hover:bg-subtle hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
