import { createClient } from './client';
import { InventoryItem, deriveStatus, deriveTotalAmount } from '@/types/inventory';

function dbRowToItem(row: Record<string, unknown>): InventoryItem {
  const arrived = row.arrived as number;
  const needed = row.needed as number;
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as InventoryItem['category'],
    quantity: row.quantity as number,
    unit: row.unit as string,
    totalAmount: deriveTotalAmount(row.quantity as number, row.unit as string),
    needed,
    arrived,
    status: deriveStatus(arrived, needed),
    assignedTo: (row.assigned_to as string) ?? undefined,
    notes: (row.notes as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getInventoryItems(roomId: string): Promise<InventoryItem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(dbRowToItem);
}

export async function addInventoryItem(
  roomId: string,
  item: Omit<InventoryItem, 'id' | 'status' | 'totalAmount' | 'createdAt' | 'updatedAt'>
): Promise<InventoryItem> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      room_id: roomId,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      needed: item.needed,
      arrived: item.arrived,
      assigned_to: item.assignedTo ?? null,
      notes: item.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return dbRowToItem(data);
}

export async function updateInventoryItem(
  id: string,
  updates: Partial<Omit<InventoryItem, 'id' | 'status' | 'totalAmount' | 'createdAt'>>
): Promise<InventoryItem> {
  const supabase = createClient();
  const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
  if (updates.unit !== undefined) dbUpdates.unit = updates.unit;
  if (updates.needed !== undefined) dbUpdates.needed = updates.needed;
  if (updates.arrived !== undefined) dbUpdates.arrived = updates.arrived;
  if (updates.assignedTo !== undefined) dbUpdates.assigned_to = updates.assignedTo ?? null;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes ?? null;

  const { data, error } = await supabase
    .from('inventory_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return dbRowToItem(data);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw error;
}

export async function updateArrivedCount(id: string, arrived: number): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('inventory_items')
    .update({ arrived, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export function exportInventoryCSV(items: InventoryItem[]): void {
  const headers = ['ID', 'Name', 'Category', 'Quantity', 'Unit', 'Total Amount', 'Needed', 'Arrived', 'Status', 'Assigned To', 'Notes'];
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
