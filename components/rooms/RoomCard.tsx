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
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4 hover:bg-muted/20 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <h3 className="font-semibold text-sm text-foreground truncate">{room.name}</h3>
            {isAdmin && (
              <span className="px-1.5 py-0.5 rounded-md text-xs font-medium bg-accent text-accent-foreground">
                Admin
              </span>
            )}
          </div>
          <CopyCode code={room.join_code} label="Code:" />
        </div>
        <Button asChild size="sm">
          <Link href={`/room/${room.join_code}`}>
            Open <ChevronRight className="size-3.5" />
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-3.5" />
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
