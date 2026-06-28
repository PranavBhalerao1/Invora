'use client';

import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineStepperProps {
  value: number;
  max: number;
  onChange: (newValue: number) => void;
}

export default function InlineStepper({ value, max, onChange }: InlineStepperProps) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.max(0, value - 1))}
        disabled={value <= 0}
        aria-label="Decrease arrived"
      >
        <Minus className="size-3" />
      </Button>
      <span className="w-7 text-center text-sm font-medium text-foreground tabular-nums">
        {value}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Increase arrived"
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
