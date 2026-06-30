'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Package,
  Receipt as ReceiptIcon,
  Plus,
  Download,
  ChevronLeft,
  LogOut,
  Shield,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getRoomByCode } from '@/lib/supabase/rooms';
import {
  getInventoryItems,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateArrivedCount,
  exportInventoryCSV,
} from '@/lib/supabase/inventory';
import { getReceipts } from '@/lib/supabase/receipts';
import { Room, Receipt } from '@/types';
import { InventoryItem, deriveStatus, deriveTotalAmount } from '@/types/inventory';

import InventoryTable from '@/components/inventory/InventoryTable';
import ItemModal from '@/components/inventory/ItemModal';
import DeleteDialog from '@/components/inventory/DeleteDialog';
import ReceiptSummaryBar from '@/components/receipts/ReceiptSummaryBar';
import ReceiptTable from '@/components/receipts/ReceiptTable';
import SubmitReceiptModal from '@/components/receipts/SubmitReceiptModal';
import CopyCode from '@/components/ui/CopyCode';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { Fab } from '@/components/ui/fab';
import { KpiCard, KpiGrid } from '@/components/ui/kpi-card';
import { RoomTab3DVisualClient } from '@/components/ui/RoomTab3DVisualClient';

import { toast } from 'sonner';

type Tab = 'inventory' | 'receipts';

export default function RoomDashboardPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();

  const [room, setRoom] = useState<Room | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('inventory');
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

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

      const roomData = await getRoomByCode(code);
      if (!roomData) {
        toast.error('Room not found');
        router.push('/');
        return;
      }
      setRoom(roomData);

      const [inv, rec] = await Promise.all([
        getInventoryItems(roomData.id),
        getReceipts(roomData.id),
      ]);
      setItems(inv);
      setReceipts(rec);
      setLoading(false);

      const channel = supabase
        .channel(`room:${roomData.id}:inventory`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'inventory_items',
            filter: `room_id=eq.${roomData.id}`,
          },
          async () => {
            const fresh = await getInventoryItems(roomData.id);
            setItems(fresh);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
    load();
  }, [code, router]);

  const isAdmin = room ? room.admin_id === userId : false;

  const handleSaveItem = useCallback(
    async (item: InventoryItem) => {
      if (!room) return;
      try {
        if (editItem) {
          const updated = await updateInventoryItem(item.id, {
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            needed: item.needed,
            arrived: item.arrived,
            assignedTo: item.assignedTo,
            notes: item.notes,
          });
          setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
          toast.success('Item updated');
        } else {
          const added = await addInventoryItem(room.id, {
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            needed: item.needed,
            arrived: item.arrived,
            assignedTo: item.assignedTo,
            notes: item.notes,
          });
          setItems((prev) => [...prev, added]);
          toast.success('Item added');
        }
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Failed to save item');
      }
      setEditItem(null);
      setShowAddModal(false);
    },
    [room, editItem]
  );

  const handleDeleteItem = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await deleteInventoryItem(deleteItem.id);
      setItems((prev) => prev.filter((i) => i.id !== deleteItem.id));
      toast.success(`"${deleteItem.name}" deleted`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
    setDeleteItem(null);
  }, [deleteItem]);

  const handleUpdateArrived = useCallback(async (id: string, arrived: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          arrived,
          status: deriveStatus(arrived, item.needed),
          totalAmount: deriveTotalAmount(item.quantity, item.unit),
          updatedAt: new Date().toISOString(),
        };
      })
    );
    try {
      await updateArrivedCount(id, arrived);
    } catch {
      // Realtime will correct on failure
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    exportInventoryCSV(items);
    toast.success('CSV exported');
  }, [items]);

  const handleReimbursed = useCallback((id: string) => {
    setReceipts((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, reimbursed: true, reimbursed_at: new Date().toISOString() } : r
      )
    );
  }, []);

  const handleReceiptSubmitted = useCallback((receipt: Receipt) => {
    setReceipts((prev) => [receipt, ...prev]);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-canvas">
        <div className="relative size-10">
          <div className="absolute inset-0 rounded-full border-2 border-accent/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!room) return null;

  const total = items.length;
  const arrived = items.filter((i) => i.status === 'arrived').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  const partial = items.filter((i) => i.status === 'partial').length;
  const arrivedPct = total > 0 ? Math.round((arrived / total) * 100) : 0;
  const pendingReceipts = receipts.filter((r) => !r.reimbursed).length;

  const tabs = [
    { value: 'inventory', label: 'Inventory', icon: Package },
    { value: 'receipts', label: 'Receipts', icon: ReceiptIcon, count: pendingReceipts },
  ];

  return (
    <div className="min-h-dvh bg-canvas">
      <main className="mx-auto w-full max-w-7xl px-5 pt-7 pb-28 sm:px-8 lg:pt-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[13px] font-medium text-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" />
            All rooms
          </Link>

          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity */}
            <div className="flex items-start gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent shadow-xs">
                <Package className="size-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-[26px] font-semibold tracking-tight text-ink">{room.name}</h1>
                  {isAdmin && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent">
                      <Shield className="size-3" />
                      Admin
                    </span>
                  )}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
                  <CopyCode code={room.join_code} label="Code" />
                  <span className="text-[13px] text-muted">
                    {items.length} item{items.length !== 1 ? 's' : ''} · {receipts.length} receipt
                    {receipts.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start lg:self-auto">
              {tab === 'inventory' && (
                <Button variant="outline" onClick={handleExportCSV}>
                  <Download className="size-4" />
                  <span className="hidden sm:inline">Export CSV</span>
                </Button>
              )}
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="size-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Tabs
            items={tabs}
            value={tab}
            onChange={(v) => setTab(v as Tab)}
            className="w-full overflow-x-auto sm:w-auto"
            layoutId={`room-tabs-${room.join_code}`}
          />
          <div className="flex shrink-0 flex-col items-end gap-2">
            {/* Tab-aware 3D visual — desktop only */}
            <div className="pointer-events-none hidden h-[152px] w-[172px] md:block">
              <RoomTab3DVisualClient tab={tab} className="h-full w-full" />
            </div>
            <div className="hidden items-center gap-2 text-[13px] text-faint sm:flex">
              <span className="size-1.5 rounded-full bg-success" />
              Synced just now
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mt-6">
          {tab === 'inventory' ? (
            <div className="flex flex-col gap-8">
              <KpiGrid className="grid-cols-2 lg:grid-cols-4">
                <KpiCard label="Total items" value={total} icon={Package} />
                <KpiCard
                  label="Arrived"
                  value={arrived}
                  icon={CheckCircle2}
                  tone="success"
                  hint={arrivedPct > 0 ? `${arrivedPct}% complete` : undefined}
                />
                <KpiCard label="Pending" value={pending} icon={Clock} />
                <KpiCard label="Partial" value={partial} icon={AlertTriangle} tone="warning" />
              </KpiGrid>

              <InventoryTable
                items={items}
                isAdmin={isAdmin}
                onEdit={(item) => setEditItem(item)}
                onDelete={(item) => setDeleteItem(item)}
                onUpdateArrived={handleUpdateArrived}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <ReceiptSummaryBar receipts={receipts} />
              <ReceiptTable receipts={receipts} isAdmin={isAdmin} onReimbursed={handleReimbursed} />
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      {tab === 'inventory' ? (
        <Fab icon={Plus} label="Add item" onClick={() => setShowAddModal(true)} />
      ) : (
        <Fab icon={ReceiptIcon} label="Submit receipt" onClick={() => setShowReceiptModal(true)} />
      )}

      {/* Modals */}
      <ItemModal
        open={showAddModal || !!editItem}
        item={editItem}
        onSave={handleSaveItem}
        onClose={() => {
          setEditItem(null);
          setShowAddModal(false);
        }}
      />

      <DeleteDialog
        open={!!deleteItem}
        itemName={deleteItem?.name ?? ''}
        onConfirm={handleDeleteItem}
        onCancel={() => setDeleteItem(null)}
      />

      {showReceiptModal && room && (
        <SubmitReceiptModal
          roomId={room.id}
          onClose={() => setShowReceiptModal(false)}
          onSubmitted={handleReceiptSubmitted}
        />
      )}
    </div>
  );
}
