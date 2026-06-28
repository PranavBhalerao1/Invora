import { getInventoryItems, addInventoryItem, updateInventoryItem } from './inventory';
import type { Category, InventoryItem } from '@/types/inventory';

interface ReceiptLineItem {
  name: string;
  quantity: string;
}

interface ParsedQuantity {
  count: number;
  unit: string;
}

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[.,'\-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseQuantity(qty: string): ParsedQuantity {
  const trimmed = qty.trim();

  // "2 x 16 oz" or "2x16oz" or "2X16OZ"
  const multMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[xX×]\s*(.+)$/);
  if (multMatch) {
    const count = parseFloat(multMatch[1]);
    return { count: isNaN(count) ? 1 : Math.round(count), unit: multMatch[2].trim() };
  }

  // Pure integer/float like "3" or "2.5"
  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)$/);
  if (numMatch) {
    const count = parseFloat(numMatch[1]);
    return { count: isNaN(count) ? 1 : Math.round(count), unit: 'ea' };
  }

  // Size descriptor like "16 oz", "12 ct", "1 lb"
  return { count: 1, unit: trimmed || 'ea' };
}

export interface SyncResult {
  succeeded: number;
  failed: number;
  errors: string[];
}

export async function syncReceiptItemsToInventory(
  roomId: string,
  receiptItems: ReceiptLineItem[],
): Promise<SyncResult> {
  const result: SyncResult = { succeeded: 0, failed: 0, errors: [] };

  const filtered = receiptItems.filter(i => i.name.trim());
  if (filtered.length === 0) return result;

  let existingItems: InventoryItem[];
  try {
    existingItems = await getInventoryItems(roomId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    result.failed = filtered.length;
    result.errors.push(`Failed to load inventory: ${msg}`);
    return result;
  }

  // normalized name → mutable snapshot so duplicate receipt lines accumulate correctly
  const normalizedMap = new Map<string, InventoryItem>();
  for (const item of existingItems) {
    normalizedMap.set(normalizeName(item.name), item);
  }

  for (const receiptItem of filtered) {
    const itemName = receiptItem.name.trim();
    const key = normalizeName(itemName);
    const { count, unit } = parseQuantity(receiptItem.quantity);

    try {
      const existing = normalizedMap.get(key);
      if (existing) {
        const updatedNeeded = existing.needed + count;
        // quantity must track needed (ItemModal always keeps them equal)
        await updateInventoryItem(existing.id, { needed: updatedNeeded, quantity: updatedNeeded });
        normalizedMap.set(key, { ...existing, needed: updatedNeeded, quantity: updatedNeeded });
      } else {
        const created = await addInventoryItem(roomId, {
          name: itemName,
          category: 'Miscellaneous' as Category,
          quantity: count,
          unit,
          needed: count,
          arrived: 0,
        });
        normalizedMap.set(key, created);
      }
      result.succeeded++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.failed++;
      result.errors.push(`"${itemName}": ${msg}`);
    }
  }

  return result;
}
