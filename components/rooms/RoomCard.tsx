'use client';

import Link from 'next/link';
import { Users, Package, ChevronRight } from 'lucide-react';
import { Room } from '@/types';
import CopyCode from '@/components/ui/CopyCode';
import { Button } from '@/components/ui/button';

interface RoomCardProps {
  room: Room;
  isAdmin: boolean;
  memberCount: number;
  itemCount: number;
}

export default function RoomCard({ room, isAdmin, memberCount, itemCount }: RoomCardProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5 hover:shadow-md transition-shadow duration-200">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <h3 className="font-semibold text-base text-foreground truncate">{room.name}</h3>
          {isAdmin && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent text-accent-foreground shrink-0">
              Admin
            </span>
          )}
        </div>
        <CopyCode code={room.join_code} label="Code:" />
      </div>

      <div className="flex items-center gap-5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-4" />
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>

      <Button asChild className="w-full">
        <Link href={`/room/${room.join_code}`}>
          Open Room
          <ChevronRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
}
