'use client';

import * as React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { AvatarGroup } from '@/components/ui/avatar';

const highlights = [
  'Track every item your camp needs across all eight days',
  'Scan receipts and capture line items in seconds',
  'Settle reimbursements without the spreadsheet shuffle',
];

export function AuthLayout({
  children,
  footer,
}: {
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Form side */}
      <div className="flex flex-1 flex-col px-6 py-8 sm:px-10 lg:py-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col">
          <Link href="/" className="inline-flex">
            <Logo />
          </Link>

          <div className="flex flex-1 flex-col justify-center py-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>

          <div className="text-[13px] text-muted">{footer}</div>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden border-l border-line bg-surface lg:flex lg:w-[46%] xl:w-[42%]">
        <div className="absolute inset-0 bg-dots opacity-60" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />

        <div className="relative z-10 flex flex-1 flex-col justify-between p-12 xl:p-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-line bg-elevated/70 px-3 py-1 text-xs font-medium text-muted backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-success" />
              Built for Sangha Shiksha Varg camps
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-[28px] leading-tight font-semibold tracking-tight text-ink text-balance">
              The calm way to run inventory and receipts for your camp.
            </h2>
            <ul className="mt-7 space-y-3.5">
              {highlights.map((h, i) => (
                <motion.li
                  key={h}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.4 }}
                  className="flex items-center gap-3 text-[15px] text-ink-soft"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <Check className="size-3" strokeWidth={3} />
                  </span>
                  {h}
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-line bg-elevated/70 p-4 backdrop-blur-sm">
            <AvatarGroup names={['Aarav S', 'Priya M', 'Rahul K', 'Neha P']} size="sm" />
            <p className="text-[13px] leading-snug text-muted">
              <span className="font-medium text-ink">Volunteers</span> keep every camp room stocked
              and reimbursed — together.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
