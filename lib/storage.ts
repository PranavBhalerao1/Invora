import { InventoryItem, deriveStatus, deriveTotalAmount } from '@/types/inventory';
import seedData from '@/data/seed.json';

const STORAGE_KEY = 'ssv_inventory';

export function loadInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seeded = (seedData as InventoryItem[]).map(item => ({
      ...item,
      status: deriveStatus(item.arrived, item.needed),
    }));
    saveInventory(seeded);
    return seeded;
  }
  try {
    const items = JSON.parse(raw) as InventoryItem[];
    return items.map(item => ({
      ...item,
      status: deriveStatus(item.arrived, item.needed),
    }));
  } catch {
    return [];
  }
}

export function saveInventory(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return;
  const normalized = items.map(item => ({
    ...item,
    status: deriveStatus(item.arrived, item.needed),
    totalAmount: deriveTotalAmount(item.quantity, item.unit),
  }));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
}

export function exportCSV(items: InventoryItem[]): void {
  const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Total Amount', 'Needed', 'Arrived', 'Status', 'Assigned To', 'Notes', 'Created At', 'Updated At'];
  const rows = items.map(item => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${item.category}"`,
    item.quantity,
    `"${item.unit}"`,
    `"${item.totalAmount}"`,
    item.needed,
    item.arrived,
    item.status,
    `"${(item.assignedTo ?? '').replace(/"/g, '""')}"`,
    `"${(item.notes ?? '').replace(/"/g, '""')}"`,
    item.createdAt,
    item.updatedAt,
  ]);
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ssv_inventory_export.csv';
  link.click();
  URL.revokeObjectURL(url);
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
