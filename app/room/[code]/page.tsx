'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Receipt as ReceiptIcon, Plus, Download, ArrowLeft, LogOut, Shield } from 'lucide-react';
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

import KPICard from '@/components/inventory/KPICard';
import InventoryTable from '@/components/inventory/InventoryTable';
import ItemModal from '@/components/inventory/ItemModal';
import DeleteDialog from '@/components/inventory/DeleteDialog';
import ReceiptSummaryBar from '@/components/receipts/ReceiptSummaryBar';
import ReceiptTable from '@/components/receipts/ReceiptTable';
import SubmitReceiptModal from '@/components/receipts/SubmitReceiptModal';
import CopyCode from '@/components/ui/CopyCode';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!room) return null;

  const total = items.length;
  const arrived = items.filter((i) => i.status === 'arrived').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  const partial = items.filter((i) => i.status === 'partial').length;
  const arrivedPct = total > 0 ? Math.round((arrived / total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 header-surface">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push('/')}
              className="shrink-0"
            >
              <ArrowLeft className="size-4" />
            </Button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-accent border border-primary/20">
              <Package className="size-4 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-semibold text-[15px] text-foreground truncate">{room.name}</h1>
                {isAdmin && (
                  <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground shrink-0">
                    <Shield className="size-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="hidden sm:block mt-0.5">
                <CopyCode code={room.join_code} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {tab === 'inventory' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportCSV}
                className="hidden sm:flex"
              >
                <Download className="size-3.5" />
                Export CSV
              </Button>
            )}
            <Button variant="ghost" size="icon-sm" onClick={handleSignOut} title="Sign out">
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tab bar */}
      <div className="sticky top-16 z-30 bg-background border-b border-border">
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex">
            {(
              [
                ['inventory', 'Inventory', Package],
                ['receipts', 'Receipts', ReceiptIcon],
              ] as const
            ).map(([t, label, Icon]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3.5 text-[15px] font-medium border-b-2 -mb-px transition-colors',
                  tab === t
                    ? 'text-primary border-primary'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                <Icon className="size-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-[1100px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-10 flex flex-col gap-8">
        {tab === 'inventory' ? (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 gap-4">
              <KPICard
                label="Total Items"
                value={total}
                icon={<Package />}
                delay={0}
              />
              <KPICard
                label="Arrived"
                value={arrived}
                subtitle={arrivedPct > 0 ? `${arrivedPct}% complete` : undefined}
                icon={<CheckCircle />}
                colorClass="text-success"
                delay={80}
              />
              <KPICard
                label="Pending"
                value={pending}
                icon={<Clock />}
                delay={160}
              />
              <KPICard
                label="Partial"
                value={partial}
                icon={<AlertTriangle />}
                colorClass="text-warning"
                delay={240}
              />
            </div>

            {/* Section header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Inventory</h2>
                <p className="text-[15px] text-muted-foreground mt-0.5">
                  {items.length} item{items.length !== 1 ? 's' : ''} tracked
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="sm:hidden"
              >
                <Download className="size-3.5" />
                Export
              </Button>
            </div>

            <InventoryTable
              items={items}
              isAdmin={isAdmin}
              onEdit={(item) => setEditItem(item)}
              onDelete={(item) => setDeleteItem(item)}
              onUpdateArrived={handleUpdateArrived}
            />
          </>
        ) : (
          <>
            <ReceiptSummaryBar receipts={receipts} />
            <ReceiptTable
              receipts={receipts}
              isAdmin={isAdmin}
              onReimbursed={handleReimbursed}
            />
          </>
        )}
      </main>

      {/* FABs */}
      {tab === 'inventory' && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-transform z-30 bg-primary"
          aria-label="Add item"
        >
          <Plus className="size-5 text-white" />
        </button>
      )}

      {tab === 'receipts' && (
        <button
          onClick={() => setShowReceiptModal(true)}
          className="fixed bottom-6 right-6 rounded-full flex items-center gap-2 px-6 h-12 shadow-lg shadow-black/10 hover:scale-105 active:scale-95 transition-transform z-30 bg-primary"
          aria-label="Submit receipt"
        >
          <Plus className="size-4 text-white" />
          <span className="text-white text-[15px] font-semibold">Submit Receipt</span>
        </button>
      )}

      {/* Modals */}
      {(showAddModal || editItem) && (
        <ItemModal
          item={editItem}
          onSave={handleSaveItem}
          onClose={() => {
            setEditItem(null);
            setShowAddModal(false);
          }}
        />
      )}

      {deleteItem && (
        <DeleteDialog
          itemName={deleteItem.name}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteItem(null)}
        />
      )}

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
