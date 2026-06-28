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
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-colors hover:bg-white/10"
      style={{ background: 'rgba(255,117,24,0.1)', border: '1px solid rgba(255,117,24,0.3)', color: '#FF7518' }}
      title="Copy join code"
    >
      {label && <span className="font-sans font-normal mr-1" style={{ color: '#8b95aa' }}>{label}</span>}
      {code}
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}
