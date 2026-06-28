'use client';

import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { markReimbursed } from '@/lib/supabase/receipts';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

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
    <Button
      size="xs"
      variant="ghost"
      onClick={handleClick}
      disabled={loading}
      className="text-success border border-success/25 bg-success/8 hover:bg-success/15 hover:text-success"
    >
      <CheckCircle className="size-3" />
      {loading ? 'Updating…' : 'Reimburse'}
    </Button>
  );
}
