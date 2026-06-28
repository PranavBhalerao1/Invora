'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Trash2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'delete';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const icons = {
  success: <CheckCircle className="w-4 h-4 text-green-400" />,
  error: <AlertCircle className="w-4 h-4 text-red-400" />,
  delete: <Trash2 className="w-4 h-4 text-red-400" />,
};

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 2000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl glass shadow-lg text-sm font-medium"
      style={{ borderLeft: '3px solid #FF7518', minWidth: 220 }}
    >
      {icons[type]}
      <span style={{ color: '#f0f4ff' }}>{message}</span>
    </motion.div>
  );
}

export function ToastContainer({ toasts }: { toasts: Array<{ id: string; message: string; type: ToastType }> }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(t => (
          <div key={t.id} className="pointer-events-auto">
            <Toast message={t.message} type={t.type} onClose={() => {}} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
