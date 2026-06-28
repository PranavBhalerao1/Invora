import { createClient } from './client';
import { Room } from '@/types';

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
  const normalized = code.trim().toUpperCase();
  console.log('[getRoomByCode] raw:', JSON.stringify(code), '→ normalized:', normalized);

  const supabase = createClient();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('join_code', normalized)
    .maybeSingle();

  if (error) {
    console.error('[getRoomByCode] Supabase error:', { message: error.message, code: error.code, details: error.details, hint: error.hint });
    throw new Error(`DB error looking up room: ${error.message}`);
  }

  console.log('[getRoomByCode] result:', data ? `found id=${data.id}` : 'not found');
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

  // Auto-join creator as member
  const { error: memberError } = await supabase
    .from('room_members')
    .insert({ room_id: room.id, user_id: user.id });

  if (memberError) {
    console.error('createRoom: room_members insert failed', { message: memberError.message, code: memberError.code, details: memberError.details });
    throw new Error(memberError.message);
  }

  return room;
}

export async function joinRoom(code: string): Promise<Room> {
  const normalized = code.trim().toUpperCase();
  if (!/^[A-Z0-9]{6}$/.test(normalized)) throw new Error('Invalid code — must be exactly 6 alphanumeric characters.');

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let room: Room | null;
  try {
    room = await getRoomByCode(normalized);
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Failed to look up room. Try again.');
  }
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
