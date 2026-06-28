'use client';

import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Receipt } from '@/types';
import ReimburseButton from './ReimburseButton';
import ReceiptDetailDrawer from './ReceiptDetailDrawer';

interface ReceiptTableProps {
  receipts: Receipt[];
  isAdmin: boolean;
  onReimbursed: (id: string) => void;
}

export default function ReceiptTable({ receipts, isAdmin, onReimbursed }: ReceiptTableProps) {
  const [selected, setSelected] = useState<Receipt | null>(null);

  const fmtDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—';

  if (receipts.length === 0) {
    return (
      <div className="glass flex flex-col items-center justify-center py-16 text-center">
        <p className="font-medium" style={{ color: '#8b95aa' }}>No receipts yet</p>
        <p className="text-sm mt-1" style={{ color: '#3d4a60' }}>Submit a receipt using the button below</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block glass overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {['Submitted By', 'Vendor', 'Date', 'Total', 'Items', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide" style={{ color: '#8b95aa' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {receipts.map(r => (
              <tr key={r.id} className="transition-colors hover:bg-white/5 cursor-pointer" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }} onClick={() => setSelected(r)}>
                <td className="px-4 py-3 font-medium" style={{ color: '#f0f4ff' }}>{r.submitted_by_name}</td>
                <td className="px-4 py-3" style={{ color: '#8b95aa' }}>{r.vendor || '—'}</td>
                <td className="px-4 py-3" style={{ color: '#8b95aa' }}>{fmtDate(r.receipt_date)}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#f0f4ff' }}>${r.total.toFixed(2)}</td>
                <td className="px-4 py-3" style={{ color: '#8b95aa' }}>{r.items?.length ?? 0} items</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.reimbursed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                    {r.reimbursed ? 'Reimbursed' : 'Pending'}
                  </span>
                </td>
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setSelected(r)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="View">
                      <Eye className="w-3.5 h-3.5" style={{ color: '#FF7518' }} />
                    </button>
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
      <div className="md:hidden flex flex-col gap-3">
        {receipts.map(r => (
          <div key={r.id} className="glass p-4 cursor-pointer hover:bg-white/[0.06] transition-colors" onClick={() => setSelected(r)}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <p className="font-medium text-sm" style={{ color: '#f0f4ff' }}>{r.submitted_by_name}</p>
                <p className="text-xs" style={{ color: '#8b95aa' }}>{r.vendor || 'Unknown vendor'} · {fmtDate(r.receipt_date)}</p>
              </div>
              <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${r.reimbursed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                {r.reimbursed ? 'Reimbursed' : 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-base font-bold" style={{ color: '#FF7518' }}>${r.total.toFixed(2)}</p>
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {isAdmin && !r.reimbursed && (
                  <ReimburseButton receiptId={r.id} onReimbursed={onReimbursed} />
                )}
              </div>
            </div>
            {r.items && r.items.length > 0 && (
              <p className="text-xs mt-1.5" style={{ color: '#3d4a60' }}>{r.items.length} line items</p>
            )}
          </div>
        ))}
      </div>

      {selected && <ReceiptDetailDrawer receipt={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
