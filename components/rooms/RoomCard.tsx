'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Package, Users, Shield } from 'lucide-react';
import { Room } from '@/types';
import CopyCode from '@/components/ui/CopyCode';
import { relativeTime } from '@/lib/utils';

interface RoomCardProps {
  room: Room;
  isAdmin: boolean;
  memberCount: number;
  itemCount: number;
  index?: number;
}

export default function RoomCard({ room, isAdmin, memberCount, itemCount, index = 0 }: RoomCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/room/${room.join_code}`} className="group block focus:outline-none">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-xl border border-line bg-elevated p-5 shadow-card transition-shadow duration-300 group-hover:shadow-lift group-focus-visible:ring-[3px] group-focus-visible:ring-accent/20"
        >
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-accent/40 to-indigo-500/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          <div className="relative flex items-start justify-between">
            <div className="flex size-11 items-center justify-center rounded-xl border border-line bg-surface text-accent shadow-xs">
              <Package className="size-5" />
            </div>
            <span className="-translate-x-1 flex size-7 items-center justify-center rounded-full text-faint opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowUpRight className="size-4" />
            </span>
          </div>

          <div className="relative mt-4">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink">{room.name}</h3>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold text-accent">
                  <Shield className="size-2.5" />
                  Admin
                </span>
              )}
            </div>
            <div className="mt-2" onClick={(e) => e.preventDefault()}>
              <CopyCode code={room.join_code} label="Code" />
            </div>
          </div>

          <div className="relative mt-5 flex items-center justify-between border-t border-line pt-4 text-[12px] text-faint">
            <span className="inline-flex items-center gap-1.5">
              <Users className="size-3.5" />
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Package className="size-3.5" />
              {itemCount} item{itemCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="relative mt-2 text-[11px] text-faint">Created {relativeTime(room.created_at)}</div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
