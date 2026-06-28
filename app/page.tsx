'use client';

import { useState, useEffect } from 'react';
import { Plus, LogIn, Package, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getUserRooms } from '@/lib/supabase/rooms';
import { Room } from '@/types';
import RoomCard from '@/components/rooms/RoomCard';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';
import JoinRoomModal from '@/components/rooms/JoinRoomModal';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RoomHubPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);
      setDisplayName(user.user_metadata?.display_name ?? user.email ?? '');

      const userRooms = await getUserRooms();
      // Fetch member and item counts
      const enriched = await Promise.all(
        userRooms.map(async room => {
          const [{ count: memberCount }, { count: itemCount }] = await Promise.all([
            supabase.from('room_members').select('*', { count: 'exact', head: true }).eq('room_id', room.id),
            supabase.from('inventory_items').select('*', { count: 'exact', head: true }).eq('room_id', room.id),
          ]);
          return { ...room, member_count: memberCount ?? 0, item_count: itemCount ?? 0 };
        })
      );
      setRooms(enriched);
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0b0f1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,117,24,0.2)', border: '1px solid rgba(255,117,24,0.3)' }}>
              <Package className="w-4 h-4" style={{ color: '#FF7518' }} />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight" style={{ color: '#f0f4ff' }}>SSV Camp App</h1>
              <p className="text-xs hidden sm:block" style={{ color: '#8b95aa' }}>{displayName}</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-colors" style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#f0f4ff' }}>Your Rooms</h2>
            <p className="text-sm mt-0.5" style={{ color: '#8b95aa' }}>Camp workspaces you belong to</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJoin(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
              style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Join Room</span>
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#FF7518', color: '#fff' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Room</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#FF7518 transparent transparent transparent' }} />
          </div>
        ) : rooms.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(255,117,24,0.1)', border: '1px solid rgba(255,117,24,0.2)' }}>
              <Package className="w-8 h-8" style={{ color: '#FF7518' }} />
            </div>
            <p className="font-semibold text-base" style={{ color: '#f0f4ff' }}>No rooms yet</p>
            <p className="text-sm mt-1 max-w-xs" style={{ color: '#8b95aa' }}>Create a new camp workspace or join one with a 6-character code.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowJoin(true)} className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors" style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}>
                Join Room
              </button>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity" style={{ background: '#FF7518', color: '#fff' }}>
                Create Room
              </button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isAdmin={room.admin_id === userId}
                memberCount={room.member_count ?? 0}
                itemCount={room.item_count ?? 0}
              />
            ))}
          </div>
        )}
      </main>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </div>
  );
}
