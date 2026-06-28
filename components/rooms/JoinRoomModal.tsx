'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import { joinRoom } from '@/lib/supabase/rooms';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface JoinRoomModalProps {
  onClose: () => void;
}

export default function JoinRoomModal({ onClose }: JoinRoomModalProps) {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.trim().length !== 6) { toast.error('Code must be 6 characters'); return; }
    setLoading(true);
    try {
      const room = await joinRoom(code.trim());
      toast.success(`Joined "${room.name}"!`);
      router.push(`/room/${room.join_code}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to join room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="relative glass w-full max-w-md"
        >
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>Join Room</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5">
              <X className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: '#f0f4ff' }}>6-Character Join Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                placeholder="AX7K2P"
                required
                autoFocus
                maxLength={6}
                className="w-full px-3 py-2.5 rounded-lg text-sm font-mono outline-none tracking-widest text-center text-xl"
                style={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.08)', color: '#f0f4ff' }}
              />
              <p className="text-xs mt-1.5" style={{ color: '#8b95aa' }}>
                Ask the room admin for the 6-character code.
              </p>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                Cancel
              </button>
              <button type="submit" disabled={loading || code.length !== 6} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity" style={{ background: '#FF7518', color: '#fff' }}>
                <LogIn className="w-4 h-4" />
                {loading ? 'Joining...' : 'Join Room'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
