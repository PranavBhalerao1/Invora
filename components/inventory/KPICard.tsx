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
  const iconContainerClass =
    colorClass === 'text-success'
      ? 'bg-success/10 text-success'
      : colorClass === 'text-warning'
      ? 'bg-warning/10 text-warning'
      : 'bg-accent text-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: delay / 1000, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center [&_svg]:size-5 shrink-0',
            iconContainerClass
          )}
        >
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className={cn('text-3xl font-bold tabular-nums', colorClass ?? 'text-foreground')}>
        {value}
      </div>
      {subtitle && (
        <div className={cn('text-sm mt-1.5 font-medium', colorClass ?? 'text-muted-foreground')}>
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
