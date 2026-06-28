'use client';

import Link from 'next/link';
import { Users, Package, ChevronRight } from 'lucide-react';
import { Room } from '@/types';
import CopyCode from '@/components/ui/CopyCode';

interface RoomCardProps {
  room: Room;
  isAdmin: boolean;
  memberCount: number;
  itemCount: number;
}

export default function RoomCard({ room, isAdmin, memberCount, itemCount }: RoomCardProps) {
  return (
    <div className="glass p-5 flex flex-col gap-4 hover:bg-white/[0.06] transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-base truncate" style={{ color: '#f0f4ff' }}>{room.name}</h3>
            {isAdmin && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(255,117,24,0.15)', color: '#FF7518' }}>
                Admin
              </span>
            )}
          </div>
          <div className="mt-2">
            <CopyCode code={room.join_code} label="Code:" />
          </div>
        </div>
        <Link
          href={`/room/${room.join_code}`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:opacity-90 shrink-0"
          style={{ background: '#FF7518', color: '#fff' }}
        >
          Open <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="flex items-center gap-4 text-sm" style={{ color: '#8b95aa' }}>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
