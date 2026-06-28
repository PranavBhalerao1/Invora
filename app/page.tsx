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
import { Button } from '@/components/ui/button';

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUserId(user.id);
      setDisplayName(user.user_metadata?.display_name ?? user.email ?? '');

      const userRooms = await getUserRooms();
      const enriched = await Promise.all(
        userRooms.map(async (room) => {
          const [{ count: memberCount }, { count: itemCount }] = await Promise.all([
            supabase
              .from('room_members')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id),
            supabase
              .from('inventory_items')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id),
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

  const firstName = displayName.includes('@') ? '' : displayName.split(' ')[0];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 header-surface">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-accent border border-primary/20">
              <Package className="size-3.5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-sm text-foreground leading-tight">SSV Camp App</h1>
              {displayName && (
                <p className="text-xs text-muted-foreground hidden sm:block">{displayName}</p>
              )}
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-14">
        {/* Hero */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-foreground">
            {firstName ? `Welcome back, ${firstName}` : 'Your Rooms'}
          </h2>
          <p className="text-base text-muted-foreground mt-1.5">
            {rooms.length > 0
              ? `${rooms.length} camp workspace${rooms.length !== 1 ? 's' : ''}`
              : 'Manage your camp workspaces below.'}
          </p>
        </div>

        {/* Action row */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Workspaces
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowJoin(true)}>
              <LogIn className="size-4" />
              <span className="hidden sm:inline">Join Room</span>
            </Button>
            <Button onClick={() => setShowCreate(true)}>
              <Plus className="size-4" />
              <span className="hidden sm:inline">Create Room</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        ) : rooms.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center py-24 text-center gap-3">
            <Package className="size-10 text-muted-foreground/30 mb-1" />
            <div>
              <p className="font-semibold text-base text-foreground">No rooms yet</p>
              <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                Create a new camp workspace or join one with a 6-character code.
              </p>
            </div>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" onClick={() => setShowJoin(true)}>
                <LogIn className="size-4" />
                Join Room
              </Button>
              <Button onClick={() => setShowCreate(true)}>
                <Plus className="size-4" />
                Create Room
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
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
