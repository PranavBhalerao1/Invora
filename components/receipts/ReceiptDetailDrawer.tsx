'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { Receipt } from '@/types';

interface ReceiptDetailDrawerProps {
  receipt: Receipt;
  onClose: () => void;
}

export default function ReceiptDetailDrawer({ receipt, onClose }: ReceiptDetailDrawerProps) {
  const fmt = (n: number | null) => n != null ? `$${n.toFixed(2)}` : '—';
  const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative glass w-full sm:max-w-lg max-h-[85vh] overflow-y-auto sm:rounded-2xl rounded-t-2xl"
        >
          <div className="sticky top-0 flex items-center justify-between px-5 py-4 z-10" style={{ background: 'rgba(17,24,39,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem 1rem 0 0' }}>
            <h2 className="text-base font-semibold" style={{ color: '#f0f4ff' }}>Receipt Detail</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-5">
            {/* Header info */}
            <div className="flex flex-col gap-1">
              <p className="text-lg font-bold" style={{ color: '#f0f4ff' }}>{receipt.vendor || 'Unknown vendor'}</p>
              <p className="text-sm" style={{ color: '#8b95aa' }}>
                {fmtDate(receipt.receipt_date)} · Submitted by {receipt.submitted_by_name}
              </p>
              <span className={`self-start mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${receipt.reimbursed ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                {receipt.reimbursed ? 'Reimbursed' : 'Pending'}
              </span>
            </div>

            {/* Image */}
            {receipt.image_url && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: '#8b95aa' }}>Receipt Image</p>
                <a href={receipt.image_url} target="_blank" rel="noopener noreferrer" className="block relative overflow-hidden rounded-xl group">
                  <img src={receipt.image_url} alt="Receipt" className="w-full object-cover rounded-xl max-h-64" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <ExternalLink className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </a>
              </div>
            )}

            {/* Line items */}
            {receipt.items && receipt.items.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: '#8b95aa' }}>Items</p>
                <div className="flex flex-col gap-1">
                  {receipt.items.map(item => (
                    <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: '#1a2235' }}>
                      <span className="text-sm" style={{ color: '#f0f4ff' }}>{item.name}</span>
                      {item.quantity && item.quantity !== '1' && (
                        <span className="text-xs ml-3 shrink-0 px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,117,24,0.12)', color: '#ffaa5e' }}>
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex justify-between px-4 py-3 text-base font-bold" style={{ color: '#f0f4ff' }}>
                <span>Total</span>
                <span style={{ color: '#FF7518' }}>{fmt(receipt.total)}</span>
              </div>
            </div>

            {receipt.notes && (
              <div className="px-3 py-2 rounded-lg" style={{ background: '#1a2235' }}>
                <p className="text-xs font-medium mb-1" style={{ color: '#8b95aa' }}>Notes</p>
                <p className="text-sm" style={{ color: '#f0f4ff' }}>{receipt.notes}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
