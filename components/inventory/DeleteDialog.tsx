'use client';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface DeleteDialogProps {
  open: boolean;
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteDialog({ open, itemName, onConfirm, onCancel }: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onCancel}
      onConfirm={onConfirm}
      title="Delete item?"
      description={
        itemName
          ? `"${itemName}" will be permanently removed from this room's inventory. This cannot be undone.`
          : undefined
      }
      confirmLabel="Delete item"
      destructive
    />
  );
}
