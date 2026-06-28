import { createClient } from './client';
import { Receipt, ReceiptItem } from '@/types';

export async function getReceipts(roomId: string): Promise<Receipt[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('receipts')
    .select('*, items:receipt_items(*)')
    .eq('room_id', roomId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Receipt[];
}

export async function submitReceipt(
  roomId: string,
  receipt: {
    submitted_by_name: string;
    vendor: string | null;
    receipt_date: string | null;
    total: number;
    notes: string | null;
    image_url: string | null;
  },
  items: { name: string; quantity: string }[]
): Promise<Receipt> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: receiptRow, error } = await supabase
    .from('receipts')
    .insert({ ...receipt, room_id: roomId, submitted_by_id: user.id })
    .select()
    .single();

  if (error) throw error;

  if (items.length > 0) {
    const lineItems = items.map(item => ({
      receipt_id: receiptRow.id,
      name: item.name,
      quantity: item.quantity,
    }));
    await supabase.from('receipt_items').insert(lineItems);
  }

  return receiptRow as Receipt;
}

export async function markReimbursed(receiptId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from('receipts')
    .update({ reimbursed: true, reimbursed_at: new Date().toISOString() })
    .eq('id', receiptId);
  if (error) throw error;
}

export async function uploadReceiptImage(file: File, receiptId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${receiptId}.${ext}`;

  const { error } = await supabase.storage
    .from('receipts')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from('receipts').getPublicUrl(path);
  return data.publicUrl;
}
