'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Package, Plus, Download } from 'lucide-react';

interface HeaderProps {
  onAddItem?: () => void;
  onExportCSV?: () => void;
}

export default function Header({ onAddItem, onExportCSV }: HeaderProps) {
  const pathname = usePathname();
  const isInventory = pathname === '/inventory';

  return (
    <header className="sticky top-0 z-40 glass" style={{ borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,117,24,0.2)', border: '1px solid rgba(255,117,24,0.3)' }}>
            <Package className="w-4 h-4" style={{ color: '#FF7518' }} />
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight" style={{ color: '#f0f4ff', fontFamily: 'var(--font-tiro, serif)' }}>
              SSV Camp Inventory
            </h1>
            <p className="text-xs hidden sm:block" style={{ color: '#8b95aa' }}>
              Sangha Shiksha Varg
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 rounded-lg p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Link
            href="/"
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              color: !isInventory ? '#FF7518' : '#8b95aa',
              background: !isInventory ? 'rgba(255,117,24,0.15)' : 'transparent',
            }}
          >
            Dashboard
          </Link>
          <Link
            href="/inventory"
            className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
            style={{
              color: isInventory ? '#FF7518' : '#8b95aa',
              background: isInventory ? 'rgba(255,117,24,0.15)' : 'transparent',
            }}
          >
            Inventory
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {isInventory && onExportCSV && (
            <button
              onClick={onExportCSV}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: '#8b95aa', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
          {onAddItem && (
            <button
              onClick={onAddItem}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors hover:opacity-90"
              style={{ background: '#FF7518', color: '#fff' }}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Item</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
