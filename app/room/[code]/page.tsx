'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Package, Receipt as ReceiptIcon, Plus, Download, ArrowLeft, LogOut, Shield } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getRoomByCode } from '@/lib/supabase/rooms';
import { getInventoryItems, addInventoryItem, updateInventoryItem, deleteInventoryItem, updateArrivedCount, exportInventoryCSV } from '@/lib/supabase/inventory';
import { getReceipts } from '@/lib/supabase/receipts';
import { Room, Receipt } from '@/types';
import { InventoryItem, deriveStatus, deriveTotalAmount } from '@/types/inventory';

import KPICard from '@/components/inventory/KPICard';
import CategoryProgress from '@/components/inventory/CategoryProgress';
import InventoryTable from '@/components/inventory/InventoryTable';
import ItemModal from '@/components/inventory/ItemModal';
import DeleteDialog from '@/components/inventory/DeleteDialog';
import ReceiptSummaryBar from '@/components/receipts/ReceiptSummaryBar';
import ReceiptTable from '@/components/receipts/ReceiptTable';
import SubmitReceiptModal from '@/components/receipts/SubmitReceiptModal';
import CopyCode from '@/components/ui/CopyCode';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      setUserId(user.id);

      const roomData = await getRoomByCode(code);
      if (!roomData) { toast.error('Room not found'); router.push('/'); return; }
      setRoom(roomData);

      const [inv, rec] = await Promise.all([
        getInventoryItems(roomData.id),
        getReceipts(roomData.id),
      ]);
      setItems(inv);
      setReceipts(rec);
      setLoading(false);

      // Realtime subscription for inventory
      const channel = supabase
        .channel(`room:${roomData.id}:inventory`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'inventory_items', filter: `room_id=eq.${roomData.id}` },
          async () => {
            const fresh = await getInventoryItems(roomData.id);
            setItems(fresh);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
    load();
  }, [code, router]);

  const isAdmin = room ? room.admin_id === userId : false;

  const handleSaveItem = useCallback(async (item: InventoryItem) => {
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
        setItems(prev => prev.map(i => i.id === updated.id ? updated : i));
        toast.success('Item updated!');
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
        setItems(prev => [...prev, added]);
        toast.success('Item added!');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save item');
    }
    setEditItem(null);
    setShowAddModal(false);
  }, [room, editItem]);

  const handleDeleteItem = useCallback(async () => {
    if (!deleteItem) return;
    try {
      await deleteInventoryItem(deleteItem.id);
      setItems(prev => prev.filter(i => i.id !== deleteItem.id));
      toast.success(`"${deleteItem.name}" deleted`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Delete failed');
    }
    setDeleteItem(null);
  }, [deleteItem]);

  const handleUpdateArrived = useCallback(async (id: string, arrived: number) => {
    // Optimistic update
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      return {
        ...item,
        arrived,
        status: deriveStatus(arrived, item.needed),
        totalAmount: deriveTotalAmount(item.quantity, item.unit),
        updatedAt: new Date().toISOString(),
      };
    }));
    try {
      await updateArrivedCount(id, arrived);
    } catch {
      // Revert on failure — realtime will correct it
    }
  }, []);

  const handleExportCSV = useCallback(() => {
    exportInventoryCSV(items);
    toast.success('CSV exported!');
  }, [items]);

  const handleReimbursed = useCallback((id: string) => {
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, reimbursed: true, reimbursed_at: new Date().toISOString() } : r));
  }, []);

  const handleReceiptSubmitted = useCallback((receipt: Receipt) => {
    setReceipts(prev => [receipt, ...prev]);
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f1a' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#FF7518 transparent transparent transparent' }} />
      </div>
    );
  }

  if (!room) return null;

  const total = items.length;
  const arrived = items.filter(i => i.status === 'arrived').length;
  const pending = items.filter(i => i.status === 'pending').length;
  const partial = items.filter(i => i.status === 'partial').length;
  const arrivedPct = total > 0 ? Math.round((arrived / total) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b0f1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 glass" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => router.push('/')} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,117,24,0.2)', border: '1px solid rgba(255,117,24,0.3)' }}>
              <Package className="w-4 h-4" style={{ color: '#FF7518' }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-bold text-base leading-tight truncate" style={{ color: '#f0f4ff' }}>{room.name}</h1>
                {isAdmin && (
                  <span className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium shrink-0" style={{ background: 'rgba(255,117,24,0.15)', color: '#FF7518' }}>
                    <Shield className="w-3 h-3" /> Admin
                  </span>
                )}
              </div>
              <div className="hidden sm:block mt-0.5">
                <CopyCode code={room.join_code} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {tab === 'inventory' && (
              <button
                onClick={handleExportCSV}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            )}
            <button onClick={handleSignOut} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" title="Sign out">
              <LogOut className="w-4 h-4" style={{ color: '#8b95aa' }} />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-16 z-30" style={{ background: '#0b0f1a', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-1">
            {([['inventory', 'Inventory', Package], ['receipts', 'Receipts', ReceiptIcon]] as const).map(([t, label, Icon]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-colors"
                style={{
                  color: tab === t ? '#FF7518' : '#8b95aa',
                  borderColor: tab === t ? '#FF7518' : 'transparent',
                }}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex flex-col gap-6">
        {tab === 'inventory' ? (
          <>
            {/* Inventory KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard label="Total Items" value={total} icon={<Package className="w-5 h-5" />} color="#FF7518" delay={0} />
              <KPICard label="Arrived" value={arrived} subtitle={`${arrivedPct}% of total`} icon={<CheckCircle className="w-5 h-5" />} color="#4ade80" delay={100} />
              <KPICard label="Pending" value={pending} icon={<Clock className="w-5 h-5" />} color="#f87171" delay={200} />
              <KPICard label="Partial" value={partial} icon={<AlertTriangle className="w-5 h-5" />} color="#facc15" delay={300} />
            </div>

            <CategoryProgress items={items} />

            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold" style={{ color: '#f0f4ff' }}>Inventory</h2>
                <p className="text-sm mt-0.5" style={{ color: '#8b95aa' }}>{items.length} item{items.length !== 1 ? 's' : ''} tracked</p>
              </div>
              <button
                onClick={handleExportCSV}
                className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors"
                style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                Export
              </button>
            </div>

            <InventoryTable
              items={items}
              isAdmin={isAdmin}
              onEdit={item => setEditItem(item)}
              onDelete={item => setDeleteItem(item)}
              onUpdateArrived={handleUpdateArrived}
            />
          </>
        ) : (
          <>
            <ReceiptSummaryBar receipts={receipts} />
            <ReceiptTable receipts={receipts} isAdmin={isAdmin} onReimbursed={handleReimbursed} />
          </>
        )}
      </main>

      {/* FABs */}
      {tab === 'inventory' && (
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-30"
          style={{ background: '#FF7518' }}
          aria-label="Add item"
        >
          <Plus className="w-6 h-6 text-white" />
        </button>
      )}

      {tab === 'receipts' && (
        <button
          onClick={() => setShowReceiptModal(true)}
          className="fixed bottom-6 right-6 rounded-full flex items-center gap-2 px-5 h-14 shadow-lg transition-transform hover:scale-105 z-30"
          style={{ background: '#FF7518' }}
          aria-label="Submit receipt"
        >
          <Plus className="w-5 h-5 text-white" />
          <span className="text-white text-sm font-semibold">Submit Receipt</span>
        </button>
      )}

      {/* Modals */}
      {(showAddModal || editItem) && (
        <ItemModal
          item={editItem}
          onSave={handleSaveItem}
          onClose={() => { setEditItem(null); setShowAddModal(false); }}
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
