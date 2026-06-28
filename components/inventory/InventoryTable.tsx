'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Search } from 'lucide-react';
import { InventoryItem, Category, Status, CATEGORIES } from '@/types/inventory';
import StatusBadge from './StatusBadge';
import InlineStepper from './InlineStepper';

interface InventoryTableProps {
  items: InventoryItem[];
  isAdmin: boolean;
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
  onUpdateArrived: (id: string, arrived: number) => void;
}

export default function InventoryTable({ items, isAdmin, onEdit, onDelete, onUpdateArrived }: InventoryTableProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All');

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    const matchStatus = statusFilter === 'All' || item.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="glass p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#8b95aa' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value as Category | 'All')}
          className="px-3 py-2 rounded-lg text-sm outline-none min-w-[160px]"
          style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as Status | 'All')}
          className="px-3 py-2 rounded-lg text-sm outline-none min-w-[130px]"
          style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
        >
          <option value="All">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="partial">Partial</option>
          <option value="arrived">Arrived</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block glass overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Name', 'Category', 'Unit', 'Needed', 'Arrived', 'Status', 'Assigned To', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide" style={{ color: '#8b95aa' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {filtered.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors hover:bg-white/5"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <td className="px-4 py-3 font-medium" style={{ color: '#f0f4ff' }}>{item.name}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#8b95aa' }}>{item.category}</td>
                      <td className="px-4 py-3" style={{ color: '#8b95aa' }}>{item.totalAmount}</td>
                      <td className="px-4 py-3 text-center" style={{ color: '#f0f4ff' }}>{item.needed}</td>
                      <td className="px-4 py-3">
                        <InlineStepper value={item.arrived} max={item.needed} onChange={v => onUpdateArrived(item.id, v)} />
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                      <td className="px-4 py-3 text-xs" style={{ color: '#8b95aa' }}>{item.assignedTo ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Edit">
                            <Pencil className="w-3.5 h-3.5" style={{ color: '#FF7518' }} />
                          </button>
                          {isAdmin && (
                            <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" aria-label="Delete">
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
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
          <div className="md:hidden flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass p-4"
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-medium text-sm" style={{ color: '#f0f4ff' }}>{item.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#8b95aa' }}>{item.category}</p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="text-xs mb-3" style={{ color: '#8b95aa' }}>{item.totalAmount}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#8b95aa' }}>Arrived:</span>
                      <InlineStepper value={item.arrived} max={item.needed} onChange={v => onUpdateArrived(item.id, v)} />
                      <span className="text-xs" style={{ color: '#8b95aa' }}>/ {item.needed}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => onEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                        <Pencil className="w-3.5 h-3.5" style={{ color: '#FF7518' }} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => onDelete(item)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                  {item.assignedTo && (
                    <p className="text-xs mt-2" style={{ color: '#8b95aa' }}>Assigned: {item.assignedTo}</p>
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

function EmptyState() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass flex flex-col items-center justify-center py-16 text-center">
      <svg width="80" height="80" viewBox="0 0 100 100" className="mb-4 opacity-30">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#FF7518" strokeWidth="2" />
        <circle cx="50" cy="50" r="30" fill="none" stroke="#FF7518" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="8" fill="#FF7518" opacity="0.5" />
        {[0, 60, 120, 180, 240, 300].map(angle => {
          const rad = (angle * Math.PI) / 180;
          return <line key={angle} x1={50 + 30 * Math.cos(rad)} y1={50 + 30 * Math.sin(rad)} x2={50 + 45 * Math.cos(rad)} y2={50 + 45 * Math.sin(rad)} stroke="#FF7518" strokeWidth="1.5" />;
        })}
      </svg>
      <p className="font-medium" style={{ color: '#8b95aa' }}>No items found</p>
      <p className="text-sm mt-1" style={{ color: '#3d4a60' }}>Try adjusting your search or filters</p>
    </motion.div>
  );
}
