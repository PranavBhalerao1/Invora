"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  hint,
  tone = "neutral",
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  delta?: { value: string; direction: "up" | "down"; positive?: boolean };
  hint?: string;
  tone?: "neutral" | "accent" | "success" | "warning" | "danger";
  className?: string;
}) {
  const iconTone = {
    neutral: "bg-subtle text-ink-soft",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
  }[tone];

  const deltaPositive = delta?.positive ?? delta?.direction === "up";

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-line bg-elevated p-5 shadow-card",
        "transition-shadow duration-300 hover:shadow-lift",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-muted">{label}</span>
        <span className={cn("flex size-8 items-center justify-center rounded-lg", iconTone)}>
          <Icon className="size-4" strokeWidth={2} />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[26px] font-semibold leading-none tracking-tight text-ink tabular">
            {value}
          </span>
          {hint && <span className="text-xs text-faint">{hint}</span>}
        </div>
        {delta && (
          <span
            className={cn(
              "mb-0.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-medium tabular",
              deltaPositive ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
            )}
          >
            {delta.direction === "up" ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {delta.value}
          </span>
        )}
      </div>
    </div>
  );
}

/** Lightweight wrapper that staggers a row of KPI cards on mount. */
export function KpiGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={cn("grid gap-4", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
