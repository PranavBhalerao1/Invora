export type Category =
  | 'Food & Grains'
  | 'Produce & Dairy'
  | 'Beverages'
  | 'Cooking Supplies'
  | 'Cleaning Supplies'
  | 'Medical & First Aid'
  | 'Sports & Activities'
  | 'Bedding & Linens'
  | 'Stationery & Craft'
  | 'Miscellaneous';

export const CATEGORIES: Category[] = [
  'Food & Grains',
  'Produce & Dairy',
  'Beverages',
  'Cooking Supplies',
  'Cleaning Supplies',
  'Medical & First Aid',
  'Sports & Activities',
  'Bedding & Linens',
  'Stationery & Craft',
  'Miscellaneous',
];

export type Status = 'pending' | 'partial' | 'arrived';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string;
  totalAmount: string;
  needed: number;
  arrived: number;
  status: Status;
  assignedTo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export function deriveStatus(arrived: number, needed: number): Status {
  if (arrived === 0) return 'pending';
  if (arrived < needed) return 'partial';
  return 'arrived';
}

export function deriveTotalAmount(quantity: number, unit: string): string {
  return `${quantity} × ${unit}`;
}
