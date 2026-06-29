'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CopyCodeProps {
  code: string;
  label?: string;
  className?: string;
}

export default function CopyCode({ code, label, className }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Join code copied!');
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-line bg-subtle px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wider text-ink-soft shadow-xs transition-colors hover:bg-line-strong/50',
        className,
      )}
      title="Copy join code"
    >
      {label && <span className="font-sans font-normal text-faint">{label}</span>}
      {code}
      {copied ? <Check className="size-3 shrink-0 text-success" /> : <Copy className="size-3 shrink-0 text-faint" />}
    </button>
  );
}
