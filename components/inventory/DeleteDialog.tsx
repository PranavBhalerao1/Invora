'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface DeleteDialogProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({ itemName, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative glass p-6 w-full max-w-sm"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.2)', border: '1px solid rgba(248,113,113,0.3)' }}>
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>Delete Item</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: '#8b95aa' }}>
            Are you sure you want to delete{' '}
            <span className="font-medium" style={{ color: '#f0f4ff' }}>{itemName}</span>? This cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: '#ef4444', color: '#fff' }}>
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
