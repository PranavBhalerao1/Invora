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
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 header-surface">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary shadow-sm shadow-primary/30 shrink-0">
              <Package className="size-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground leading-tight tracking-tight">SSV Camp App</p>
              {displayName && (
                <p className="text-xs text-muted-foreground hidden sm:block leading-none mt-0.5 truncate max-w-48">
                  {displayName}
                </p>
              )}
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-12 sm:py-16">

        {/* ── Hero Panel ── */}
        <section
          className="relative overflow-hidden rounded-3xl border border-indigo-100/90 mb-12 sm:mb-16"
          style={{
            background: 'linear-gradient(135deg, #eef2ff 0%, #f8f9ff 60%, #f5f3ff 100%)',
          }}
        >
          {/* Decorative orbs */}
          <div
            className="absolute -top-16 -right-16 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
            aria-hidden
          />

          <div className="relative px-8 py-12 sm:px-14 sm:py-16">
            <div className="flex items-start justify-between gap-10 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary/70 tracking-widest uppercase mb-4">
                  Sangha Shiksha Varg
                </p>
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground leading-tight">
                  {firstName ? `Welcome back, ${firstName}` : 'Your Workspaces'}
                </h1>
                <p className="mt-3 text-[15px] text-muted-foreground max-w-sm leading-relaxed">
                  {loading
                    ? 'Loading your workspaces…'
                    : rooms.length > 0
                    ? `${rooms.length} camp workspace${rooms.length !== 1 ? 's' : ''} — inventory and receipts, all in one place.`
                    : 'Create or join a workspace to start managing camp inventory and receipts.'}
                </p>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Button size="lg" onClick={() => setShowCreate(true)}>
                    <Plus className="size-4" />
                    Create Room
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowJoin(true)}
                    className="border-indigo-200 bg-white/70 hover:bg-white"
                  >
                    <LogIn className="size-4" />
                    Join with Code
                  </Button>
                </div>
              </div>

              {/* Brand mark */}
              <div className="hidden sm:flex items-center justify-center w-24 h-24 rounded-2xl bg-white/80 border border-indigo-100 shadow-[0_4px_20px_rgba(79,70,229,0.10)] shrink-0">
                <Package className="size-10 text-primary/40" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Workspaces Grid ── */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-primary/15" />
              <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center gap-5 rounded-3xl border-2 border-dashed border-border">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Package className="size-7 text-muted-foreground/40" />
            </div>
            <div className="max-w-xs">
              <p className="font-semibold text-base text-foreground">No workspaces yet</p>
              <p className="text-[15px] text-muted-foreground mt-2 leading-relaxed">
                Use the buttons above to create a new camp workspace or join one with a 6-character code.
              </p>
            </div>
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-6">
              Workspaces
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
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
          </>
        )}
      </main>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </div>
  );
}
