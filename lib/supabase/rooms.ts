import { createClient } from './client';
import { Room } from '@/types';
import seedData from '@/data/seed.json';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function getUserRooms(): Promise<Room[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getRoomByCode(code: string): Promise<Room | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('join_code', code.toUpperCase())
    .single();

  if (error) return null;
  return data;
}

export async function createRoom(name: string): Promise<Room> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const join_code = generateJoinCode();

  const { data: room, error } = await supabase
    .from('rooms')
    .insert({ name, join_code, admin_id: user.id })
    .select()
    .single();

  if (error) {
    console.error('createRoom: rooms insert failed', { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error(error.message);
  }

  // Auto-join as member — must succeed before seeding inventory (RLS requires membership)
  const { error: memberError } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: user.id });

  if (memberError) {
    console.error('createRoom: room_members insert failed', { message: memberError.message, code: memberError.code, details: memberError.details });
    throw new Error(memberError.message);
  }

  // Seed inventory
  const seedItems = (seedData as Array<Record<string, unknown>>).map(item => ({
    room_id: room.id,
    name: item.name as string,
    category: item.category as string,
    quantity: item.quantity as number,
    unit: item.unit as string,
    needed: item.needed as number,
    arrived: item.arrived as number,
    assigned_to: (item.assignedTo as string) ?? null,
    notes: (item.notes as string) ?? null,
  }));

  const { error: seedError } = await supabase.from('inventory_items').insert(seedItems);
  if (seedError) {
    console.error('createRoom: inventory seed failed', { message: seedError.message, code: seedError.code });
  }

  return room;
}

export async function joinRoom(code: string): Promise<Room> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const room = await getRoomByCode(code);
  if (!room) throw new Error('Room not found. Check the code and try again.');

  const { error } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: user.id });

  if (error && error.code !== '23505') throw error; // ignore duplicate key

  return room;
}

export async function getRoomMemberCount(roomId: string): Promise<number> {
  const supabase = createClient();
  const { count } = await supabase
    .from('room_members')
    .select('*', { count: 'exact', head: true })
    .eq('room_id', roomId);
  return count ?? 0;
}
