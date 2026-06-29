'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Search, Package, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { InventoryItem, Category, Status, CATEGORIES } from '@/types/inventory';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import StatusBadge from './StatusBadge';
import InlineStepper from './InlineStepper';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateArrived: (id: string, arrived: number) => void;
}

type SortField = 'name' | 'status' | 'progress';
type SortDir = 'asc' | 'desc';

const statusOrder: Record<Status, number> = { pending: 0, partial: 1, arrived: 2 };

function progressBarClass(status: Status) {
  if (status === 'arrived') return '[&_[data-slot=progress-indicator]]:bg-success';
  if (status === 'partial') return '[&_[data-slot=progress-indicator]]:bg-warning';
  return '[&_[data-slot=progress-indicator]]:bg-muted-foreground/40';
}

function SortButton({
  label,
  field,
  sort,
  onSort,
}: {
  label: string;
  field: SortField;
  sort: { field: SortField; dir: SortDir } | null;
  onSort: (f: SortField) => void;
}) {
  const active = sort?.field === field;
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-medium tracking-wide uppercase transition-colors select-none',
        active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/80'
      )}
    >
      {label}
      {active ? (
        sort?.dir === 'asc' ? (
          <ChevronUp className="size-3" />
        ) : (
          <ChevronDown className="size-3" />
        )
      ) : (
        <ChevronsUpDown className="size-3 opacity-30" />
      )}
    </button>
  );
}

export default function InventoryTable({
  items,
  isAdmin,
  onEdit,
  onDelete,
  onUpdateArrived,
}: InventoryTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir } | null>(null);

  function handleSort(field: SortField) {
    setSort((prev) =>
      !prev || prev.field !== field
        ? { field, dir: 'asc' }
        : prev.dir === 'asc'
        ? { field, dir: 'desc' }
        : null
    );
  }

  const filtered = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const sorted = sort
    ? [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sort.field === 'name') cmp = a.name.localeCompare(b.name);
        else if (sort.field === 'status')
          cmp = statusOrder[a.status] - statusOrder[b.status];
        else if (sort.field === 'progress') {
          const pa = a.needed > 0 ? a.arrived / a.needed : 0;
          const pb = b.needed > 0 ? b.arrived / b.needed : 0;
          cmp = pa - pb;
        }
        return sort.dir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const isFiltered = !!search || categoryFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="flex flex-col gap-4">
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items…"
            className="pl-9"
          />
        </div>
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as Category | 'All')}
        >
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as Status | 'All')}
        >
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="arrived">Arrived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState isFiltered={isFiltered} />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left">
                    <SortButton label="Item" field="name" sort={sort} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton label="Progress" field="progress" sort={sort} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left">
                    <SortButton label="Status" field="status" sort={sort} onSort={handleSort} />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Assigned
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {sorted.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.015 }}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      {/* Item: name + category */}
                      <td className="px-4 py-3">
                        <p className="font-medium text-foreground leading-tight">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.category}</p>
                      </td>

                      {/* Amount (qty × unit) */}
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                        {item.totalAmount}
                      </td>

                      {/* Progress: stepper + X / Y + thin bar */}
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <InlineStepper
                              value={item.arrived}
                              max={item.needed}
                              onChange={(v) => onUpdateArrived(item.id, v)}
                            />
                            <span className="text-xs text-muted-foreground tabular-nums">
                              / {item.needed}
                            </span>
                          </div>
                          <Progress
                            value={item.needed > 0 ? (item.arrived / item.needed) * 100 : 0}
                            className={cn('h-0.5 w-20', progressBarClass(item.status))}
                          />
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <StatusBadge status={item.status} />
                      </td>

                      {/* Assigned */}
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {item.assignedTo ?? '—'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onEdit(item)}
                            aria-label="Edit"
                          >
                            <Pencil className="size-3.5 text-primary" />
                          </Button>
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => onDelete(item)}
                              aria-label="Delete"
                            >
                              <Trash2 className="size-3.5 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {sorted.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.025 }}
                  className="bg-card border border-border rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs mt-0.5 text-muted-foreground">{item.category}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <p className="text-xs mb-3 text-muted-foreground">{item.totalAmount}</p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Arrived</span>
                        <InlineStepper
                          value={item.arrived}
                          max={item.needed}
                          onChange={(v) => onUpdateArrived(item.id, v)}
                        />
                        <span className="text-xs text-muted-foreground">/ {item.needed}</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => onEdit(item)}
                          aria-label="Edit"
                        >
                          <Pencil className="size-3.5 text-primary" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => onDelete(item)}
                            aria-label="Delete"
                          >
                            <Trash2 className="size-3.5 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <Progress
                      value={item.needed > 0 ? (item.arrived / item.needed) * 100 : 0}
                      className={cn('h-0.5', progressBarClass(item.status))}
                    />
                  </div>

                  {item.assignedTo && (
                    <p className="text-xs mt-2.5 text-muted-foreground">
                      Assigned: {item.assignedTo}
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border rounded-xl flex flex-col items-center justify-center py-20 text-center gap-2"
    >
      <Package className="size-8 text-muted-foreground/30 mb-1" />
      {isFiltered ? (
        <>
          <p className="text-sm font-medium text-foreground">No items match your filters</p>
          <p className="text-xs text-muted-foreground/60">
            Try adjusting the search or category filter
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-foreground">No inventory items yet</p>
          <p className="text-xs text-muted-foreground/60">
            Use the + button to add the first item
          </p>
        </>
      )}
    </motion.div>
  );
}
