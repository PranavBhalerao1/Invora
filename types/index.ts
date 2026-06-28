export type { Category, Status, InventoryItem } from './inventory';
export { CATEGORIES, deriveStatus, deriveTotalAmount } from './inventory';

export interface Room {
  id: string;
  name: string;
  join_code: string;
  admin_id: string;
  created_at: string;
  member_count?: number;
  item_count?: number;
}

export interface RoomMember {
  room_id: string;
  user_id: string;
  joined_at: string;
}

export interface Receipt {
  id: string;
  room_id: string;
  submitted_by_id: string;
  submitted_by_name: string;
  vendor: string | null;
  receipt_date: string | null;
  subtotal: number | null;
  tax: number | null;
  total: number;
  image_url: string | null;
  reimbursed: boolean;
  reimbursed_at: string | null;
  notes: string | null;
  created_at: string;
  items?: ReceiptItem[];
}

export interface ReceiptItem {
  id: string;
  receipt_id: string;
  name: string;
  price: number;
}

export interface GeminiReceiptResult {
  vendor: string;
  date: string;
  items: { name: string; price: number }[];
  subtotal: number;
  tax: number;
  total: number;
}
