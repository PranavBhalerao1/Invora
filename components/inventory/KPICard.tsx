'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface KPICardProps {
  label: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
}

function useCountUp(target: number, duration = 800, delay = 0) {
  const [count, setCount] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * target));
        if (progress < 1) raf.current = requestAnimationFrame(animate);
      };
      raf.current = requestAnimationFrame(animate);
    }, delay);
    return () => { clearTimeout(timeout); if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration, delay]);

  return count;
}

export default function KPICard({ label, value, subtitle, icon, color = '#FF7518', delay = 0 }: KPICardProps) {
  const count = useCountUp(value, 800, delay);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: delay / 1000 }}
      className="glass p-5 flex flex-col gap-3"
    >
      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight" style={{ color: '#f0f4ff' }}>{count}</div>
        {subtitle && <div className="text-xs mt-0.5" style={{ color }}>{subtitle}</div>}
        <div className="text-sm mt-1" style={{ color: '#8b95aa' }}>{label}</div>
      </div>
    </motion.div>
  );
}
