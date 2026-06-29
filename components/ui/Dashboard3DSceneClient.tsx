'use client';

import dynamic from 'next/dynamic';

const Dashboard3DSceneInner = dynamic(
  () => import('./Dashboard3DScene').then((m) => ({ default: m.Dashboard3DScene })),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full animate-pulse rounded-xl bg-accent-soft/40" />
    ),
  }
);

export function Dashboard3DSceneClient({ className }: { className?: string }) {
  return <Dashboard3DSceneInner className={className} />;
}
