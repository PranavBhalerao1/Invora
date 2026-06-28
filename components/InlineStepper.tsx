'use client';

import { Minus, Plus } from 'lucide-react';

interface InlineStepperProps {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
}

export default function InlineStepper({ value, max, onChange }: InlineStepperProps) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        className="w-6 h-6 rounded flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/10"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Decrease arrived"
      >
        <Minus className="w-3 h-3" style={{ color: '#f0f4ff' }} />
      </button>
      <span className="w-8 text-center text-sm font-medium" style={{ color: '#f0f4ff' }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-6 h-6 rounded flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-white/10"
        style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        aria-label="Increase arrived"
      >
        <Plus className="w-3 h-3" style={{ color: '#f0f4ff' }} />
      </button>
    </div>
  );
}
