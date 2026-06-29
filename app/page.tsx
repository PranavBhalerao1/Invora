'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Plus,
  LogIn,
  LogOut,
  Package,
  Search as SearchIcon,
  Sparkles,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getUserRooms } from '@/lib/supabase/rooms';
import { Room } from '@/types';
import RoomCard from '@/components/rooms/RoomCard';
import CreateRoomModal from '@/components/rooms/CreateRoomModal';
import JoinRoomModal from '@/components/rooms/JoinRoomModal';
import { Logo } from '@/components/ui/logo';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/ui/search-bar';
import { EmptyState } from '@/components/ui/empty-state';
import { Avatar } from '@/components/ui/avatar';
import { toast } from 'sonner';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function RoomHubPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

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
  const featured = rooms[0];
  const filtered = rooms.filter(
    (r) =>
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.join_code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-dvh">
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
          <Link href="/" className="shrink-0">
            <Logo />
          </Link>
          <div className="flex-1" />
          <div className="flex shrink-0 items-center gap-2">
            {displayName && (
              <div className="flex items-center gap-2 rounded-lg p-0.5 pr-2">
                <Avatar name={firstName || displayName} size="sm" ring={false} />
                <span className="hidden max-w-40 truncate text-[13px] font-medium text-ink-soft sm:inline">
                  {firstName || displayName}
                </span>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5">
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 sm:px-8">
        {/* Header */}
        <div className="flex flex-col gap-5 pt-10 pb-8 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-[13px] font-medium text-accent">
              {greeting()}{firstName ? `, ${firstName}` : ''}
            </p>
            <h1 className="mt-1.5 text-[28px] font-semibold tracking-tight text-ink sm:text-[32px]">
              Your rooms
            </h1>
            <p className="mt-1.5 max-w-md text-[15px] text-muted">
              Shared camp workspaces where you track inventory and submit receipts together.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-2.5"
          >
            <Button variant="outline" onClick={() => setJoinOpen(true)}>
              <LogIn className="size-4" />
              Join room
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Create room
            </Button>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="relative size-10">
              <div className="absolute inset-0 rounded-full border-2 border-accent/15" />
              <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          </div>
        ) : rooms.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line-strong bg-surface/50">
            <EmptyState
              icon={Package}
              title="No rooms yet"
              description="Create a new camp workspace or join one with a 6-character code to start tracking inventory and receipts."
              action={
                <div className="flex items-center gap-2.5">
                  <Button variant="outline" onClick={() => setJoinOpen(true)}>
                    <LogIn className="size-4" />
                    Join room
                  </Button>
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="size-4" />
                    Create room
                  </Button>
                </div>
              }
            />
          </div>
        ) : (
          <>
            {/* Continue / featured */}
            {featured && (
              <motion.section
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link href={`/room/${featured.join_code}`} className="group block focus:outline-none">
                  <div className="relative overflow-hidden rounded-2xl border border-line bg-elevated shadow-card transition-shadow duration-300 group-hover:shadow-lift group-focus-visible:ring-[3px] group-focus-visible:ring-accent/20">
                    <div className="absolute inset-0 bg-grid opacity-[0.4] mask-fade-b" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/35 to-transparent" />
                    <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                      <div className="flex items-start gap-4">
                        <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent shadow-xs">
                          <Package className="size-7" />
                        </div>
                        <div>
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                            <Sparkles className="size-3" />
                            Jump back in
                          </span>
                          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                            {featured.name}
                          </h2>
                          <p className="mt-1 max-w-sm text-sm text-muted">
                            Inventory &amp; receipts for your camp, all in one place.
                          </p>
                          <div className="mt-3 flex items-center gap-3 text-xs text-faint">
                            <span className="inline-flex items-center gap-1.5">
                              <Users className="size-3.5" />
                              {featured.member_count ?? 0} member{(featured.member_count ?? 0) !== 1 ? 's' : ''}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Package className="size-3.5" />
                              {featured.item_count ?? 0} item{(featured.item_count ?? 0) !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button className="self-start sm:self-auto" tabIndex={-1}>
                        Open room
                        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Button>
                    </div>
                  </div>
                </Link>
              </motion.section>
            )}

            {/* All rooms */}
            <section className="mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <h2 className="text-base font-semibold tracking-tight text-ink">All rooms</h2>
                  <span className="rounded-full bg-subtle px-2 py-0.5 text-xs font-medium text-muted tabular">
                    {rooms.length}
                  </span>
                </div>
                <SearchBar
                  value={query}
                  onChange={setQuery}
                  placeholder="Search rooms or codes..."
                  className="w-full sm:w-72"
                />
              </div>

              {filtered.length > 0 ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filtered.map((room, i) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      index={i}
                      isAdmin={room.admin_id === userId}
                      memberCount={room.member_count ?? 0}
                      itemCount={room.item_count ?? 0}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface/50">
                  <EmptyState
                    icon={SearchIcon}
                    title="No rooms found"
                    description={`Nothing matches "${query}". Try a different name or create a new room.`}
                    action={
                      <Button variant="outline" onClick={() => setQuery('')}>
                        Clear search
                      </Button>
                    }
                  />
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} />
    </div>
  );
}
