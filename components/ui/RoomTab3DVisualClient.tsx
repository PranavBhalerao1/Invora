'use client';

import dynamic from 'next/dynamic';

type TabMode = 'inventory' | 'receipts';

const RoomTab3DVisualInner = dynamic(
  () => import('./RoomTab3DVisual').then((m) => ({ default: m.RoomTab3DVisual })),
  { ssr: false, loading: () => <div className="h-full w-full" /> }
);

export function RoomTab3DVisualClient({ tab, className }: { tab: TabMode; className?: string }) {
  return <RoomTab3DVisualInner tab={tab} className={className} />;
}
