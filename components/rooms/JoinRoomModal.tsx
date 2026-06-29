'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';
import { joinRoom } from '@/lib/supabase/rooms';
import { Modal, ModalBody, ModalFooter, ModalHeader } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const LEN = 6;

interface JoinRoomModalProps {
  open: boolean;
  onClose: () => void;
}

export default function JoinRoomModal({ open, onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [chars, setChars] = React.useState<string[]>(Array(LEN).fill(''));
  const [loading, setLoading] = React.useState(false);
  const refs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    if (open) {
      queueMicrotask(() => {
        setChars(Array(LEN).fill(''));
        setLoading(false);
      });
      setTimeout(() => refs.current[0]?.focus(), 50);
    }
  }, [open]);

  const code = chars.join('');
  const complete = code.length === LEN;

  function setAt(i: number, value: string) {
    const v = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!v) {
      setChars((prev) => prev.map((c, idx) => (idx === i ? '' : c)));
      return;
    }
    if (v.length > 1) {
      const next = v.slice(0, LEN).split('');
      setChars(Array.from({ length: LEN }, (_, idx) => next[idx] ?? ''));
      refs.current[Math.min(v.length, LEN - 1)]?.focus();
      return;
    }
    setChars((prev) => prev.map((c, idx) => (idx === i ? v : c)));
    if (i < LEN - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !chars[i] && i > 0) refs.current[i - 1]?.focus();
  }

  async function handleJoin() {
    if (!complete) return;
    setLoading(true);
    try {
      const room = await joinRoom(code);
      toast.success(`Joined "${room.name}"!`);
      router.push(`/room/${room.join_code}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join room');
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <ModalHeader
        title="Join a room"
        description="Enter the 6-character invite code you were given."
        onClose={onClose}
        icon={<LogIn className="size-5 text-accent" />}
      />
      <ModalBody className="pt-2 pb-4">
        <div
          className="flex justify-center gap-2 py-2"
          onPaste={(e) => setAt(0, e.clipboardData.getData('text'))}
        >
          {chars.map((c, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={c}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              inputMode="text"
              maxLength={1}
              className={cn(
                'size-12 rounded-xl border bg-elevated text-center font-mono text-lg font-semibold tracking-tight text-ink uppercase shadow-xs transition-all outline-none',
                c ? 'border-accent/50' : 'border-line-strong',
                'focus:border-accent/70 focus:ring-[3px] focus:ring-accent/12',
              )}
            />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-faint">
          Ask the room admin for the 6-character code.
        </p>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleJoin} loading={loading} disabled={!complete}>
          {loading ? 'Joining…' : 'Join room'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
