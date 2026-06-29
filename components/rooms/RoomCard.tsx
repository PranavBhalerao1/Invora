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
    <div className="group card-elevated flex flex-col overflow-hidden">
      {/* Card body */}
      <div className="flex-1 p-6 pb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h3 className="font-semibold text-lg text-foreground leading-snug">{room.name}</h3>
          {isAdmin && (
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase bg-accent text-accent-foreground border border-primary/15 shrink-0 mt-0.5">
              Admin
            </span>
          )}
        </div>
        <CopyCode code={room.join_code} label="Join code:" />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 px-6 py-3.5 border-t border-border/60 text-sm text-muted-foreground bg-muted/20">
        <span className="flex items-center gap-2">
          <Users className="size-4 shrink-0" />
          {memberCount} member{memberCount !== 1 ? 's' : ''}
        </span>
        <span className="flex items-center gap-2">
          <Package className="size-4 shrink-0" />
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
