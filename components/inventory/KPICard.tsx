'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass?: string;
  delay?: number;
}

export default function KPICard({
  label,
  value,
  subtitle,
  icon,
  colorClass,
  delay = 0,
}: KPICardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: delay / 1000, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          {label}
        </span>
        <span className="text-muted-foreground/50 [&_svg]:size-4">{icon}</span>
      </div>
      <div className="text-2xl font-bold text-foreground tabular-nums">{value}</div>
      {subtitle && (
        <div className={cn('text-xs mt-1 font-medium', colorClass ?? 'text-muted-foreground')}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
