'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { createRoom } from '@/lib/supabase/rooms';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';

interface CreateRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setName('');
      setLoading(false);
    });
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const room = await createRoom(name.trim());
      toast.success('Room created!');
      router.push(`/room/${room.join_code}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create room');
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader
          title="Create a room"
          description="Spin up a shared camp workspace for inventory and receipts."
          onClose={onClose}
          icon={<Sparkles className="size-5 text-accent" />}
        />
        <ModalBody className="space-y-5 pt-2">
          <Field label="Room name" htmlFor="room-name">
            <Input
              id="room-name"
              placeholder="e.g. NJ Camp 2026"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              required
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border border-dashed border-line-strong bg-surface px-3.5 py-3">
            <div>
              <p className="text-[13px] font-medium text-ink-soft">Invite code</p>
              <p className="text-xs text-faint">A 6-character join code is generated automatically.</p>
            </div>
            <span className="rounded-md border border-line bg-elevated px-2.5 py-1 font-mono text-sm font-semibold tracking-widest text-faint shadow-xs">
              ••••••
            </span>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} disabled={!name.trim()}>
            {loading ? 'Creating…' : 'Create room'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
