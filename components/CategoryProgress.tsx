'use client';

import { motion } from 'framer-motion';
import { InventoryItem, Category, CATEGORIES } from '@/types/inventory';

interface CategoryProgressProps {
  items: InventoryItem[];
}

export default function CategoryProgress({ items }: CategoryProgressProps) {
  const stats = CATEGORIES.map(cat => {
    const catItems = items.filter(i => i.category === cat);
    const needed = catItems.reduce((sum, i) => sum + i.needed, 0);
    const arrived = catItems.reduce((sum, i) => sum + i.arrived, 0);
    const pct = needed > 0 ? Math.round((arrived / needed) * 100) : 0;
    return { cat, needed, arrived, pct, count: catItems.length };
  }).filter(s => s.count > 0);

  return (
    <div className="glass p-5">
      <h2 className="font-semibold text-base mb-4" style={{ color: '#f0f4ff' }}>
        Category Progress
      </h2>
      <div className="flex flex-col gap-4">
        {stats.map(({ cat, arrived, needed, pct }, i) => (
          <div key={cat}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-sm font-medium" style={{ color: '#f0f4ff' }}>{cat}</span>
              <span className="text-xs" style={{ color: '#8b95aa' }}>
                {arrived}/{needed} units · {pct}%
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1a2235' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: pct === 100 ? '#4ade80' : '#FF7518' }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: 'easeOut' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
