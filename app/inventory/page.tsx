'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, deriveStatus } from '@/types/inventory';
import { loadInventory, saveInventory, exportCSV } from '@/lib/storage';
import Header from '@/components/Header';
import InventoryTable from '@/components/InventoryTable';
import ItemModal from '@/components/ItemModal';
import DeleteDialog from '@/components/DeleteDialog';
import { ToastContainer } from '@/components/Toast';
import type { ToastType } from '@/components/Toast';
import { Plus } from 'lucide-react';

interface ToastEntry { id: string; message: string; type: ToastType; }

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<InventoryItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  useEffect(() => {
    setItems(loadInventory());
    setMounted(true);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2500);
  }, []);

  const handleSave = useCallback((item: InventoryItem) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      const updated = exists
        ? prev.map(i => i.id === item.id ? item : i)
        : [...prev, item];
      saveInventory(updated);
      return updated;
    });
    const isEdit = !!editItem;
    setEditItem(null);
    setShowAddModal(false);
    addToast(isEdit ? 'Item updated!' : 'Item added!', 'success');
  }, [editItem, addToast]);

  const handleDelete = useCallback(() => {
    if (!deleteItem) return;
    setItems(prev => {
      const updated = prev.filter(i => i.id !== deleteItem.id);
      saveInventory(updated);
      return updated;
    });
    addToast(`"${deleteItem.name}" deleted`, 'delete');
    setDeleteItem(null);
  }, [deleteItem, addToast]);

  const handleUpdateArrived = useCallback((id: string, arrived: number) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id !== id) return item;
        return {
          ...item,
          arrived,
          status: deriveStatus(arrived, item.needed),
          updatedAt: new Date().toISOString(),
        };
      });
      saveInventory(updated);
      return updated;
    });
  }, []);

  const handleExportCSV = useCallback(() => {
    exportCSV(items);
    addToast('CSV exported!', 'success');
  }, [items, addToast]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0b0f1a' }}>
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: '#FF7518 transparent transparent transparent' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0b0f1a' }}>
      <Header
        onAddItem={() => setShowAddModal(true)}
        onExportCSV={handleExportCSV}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold" style={{ color: '#f0f4ff' }}>Inventory</h1>
            <p className="text-sm mt-0.5" style={{ color: '#8b95aa' }}>
              {items.length} item{items.length !== 1 ? 's' : ''} tracked
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            className="sm:hidden flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
            style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Export
          </button>
        </div>

        <InventoryTable
          items={items}
          onEdit={item => setEditItem(item)}
          onDelete={item => setDeleteItem(item)}
          onUpdateArrived={handleUpdateArrived}
        />
      </main>

      {/* FAB */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 z-30"
        style={{ background: '#FF7518' }}
        aria-label="Add item"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {(showAddModal || editItem) && (
        <ItemModal
          item={editItem}
          onSave={handleSave}
          onClose={() => { setEditItem(null); setShowAddModal(false); }}
        />
      )}

      {deleteItem && (
        <DeleteDialog
          itemName={deleteItem.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
