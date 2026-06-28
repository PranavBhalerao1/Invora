'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 35 }}
          className="relative bg-popover border border-border rounded-xl p-6 w-full max-w-sm shadow-xl shadow-black/40"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-destructive/10 border border-destructive/20">
              <Trash2 className="size-4 text-destructive" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Delete Item</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">{itemName}</span>? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="destructive" className="flex-1" onClick={onConfirm}>
              Delete
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
