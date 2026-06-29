"use client";

import { motion } from "framer-motion";
import { cn, clamp } from "@/lib/utils";

type Tone = "accent" | "success" | "warning" | "danger" | "neutral";

const toneMap: Record<Tone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-ink",
};

export function Progress({
  value,
  tone = "accent",
  className,
  trackClassName,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  trackClassName?: string;
}) {
  const pct = clamp(value, 0, 100);
  return (
    <div
      className={cn("h-1.5 w-full overflow-hidden rounded-full bg-subtle", trackClassName, className)}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn("h-full rounded-full", toneMap[tone])}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

/** Compact circular progress for tight spaces. */
export function ProgressRing({
  value,
  size = 36,
  stroke = 4,
  tone = "accent",
}: {
  value: number;
  size?: number;
  stroke?: number;
  tone?: Tone;
}) {
  const pct = clamp(value, 0, 100);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const strokeColor = {
    accent: "stroke-accent",
    success: "stroke-success",
    warning: "stroke-warning",
    danger: "stroke-danger",
    neutral: "stroke-ink",
  }[tone];

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} className="fill-none stroke-subtle" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        strokeWidth={stroke}
        strokeLinecap="round"
        className={cn("fill-none", strokeColor)}
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - (pct / 100) * c }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
