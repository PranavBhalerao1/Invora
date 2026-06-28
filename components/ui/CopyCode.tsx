'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyCodeProps {
  code: string;
  label?: string;
}

export default function CopyCode({ code, label }: CopyCodeProps) {
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
      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-mono font-semibold transition-colors hover:bg-accent bg-accent/50 text-primary border border-primary/20"
      title="Copy join code"
    >
      {label && (
        <span className="font-sans font-normal text-muted-foreground">{label}</span>
      )}
      {code}
      {copied ? (
        <Check className="size-3 shrink-0" />
      ) : (
        <Copy className="size-3 shrink-0" />
      )}
    </button>
  );
}
