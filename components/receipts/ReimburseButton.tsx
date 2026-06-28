'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { markReimbursed } from '@/lib/supabase/receipts';
import { toast } from 'sonner';

interface ReimburseButtonProps {
  receiptId: string;
  onReimbursed: (id: string) => void;
}

export default function ReimburseButton({ receiptId, onReimbursed }: ReimburseButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await markReimbursed(receiptId);
      onReimbursed(receiptId);
      toast.success('Marked as reimbursed');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark reimbursed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }}
    >
      <CheckCircle className="w-3.5 h-3.5" />
      {loading ? 'Updating...' : 'Reimburse'}
    </button>
  );
}
