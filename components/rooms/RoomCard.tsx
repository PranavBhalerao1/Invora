'use client';

import Link from 'next/link';
import { Users, Package, ArrowRight } from 'lucide-react';
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
    <div className="group card-elevated flex flex-col gap-0 overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6 pb-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="font-semibold text-base text-foreground leading-snug">{room.name}</h3>
          {isAdmin && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-accent text-accent-foreground border border-primary/15 shrink-0 mt-0.5">
              Admin
            </span>
          )}
        </div>
        <CopyCode code={room.join_code} label="Code:" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-5 px-6 py-3 border-t border-border/50 text-xs text-muted-foreground bg-muted/30">
        <span className="flex items-center gap-1.5">
          <Users className="size-3.5 shrink-0" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-1.5">
          <Package className="size-3.5 shrink-0" />
          {itemCount} item{itemCount !== 1 ? 's' : ''}
        </span>
      </div>

      {/* CTA */}
      <div className="px-6 py-4">
        <Button asChild className="w-full justify-between">
          <Link href={`/room/${room.join_code}`}>
            Open Room
            <ArrowRight className="size-4 group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
