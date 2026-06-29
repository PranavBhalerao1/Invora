"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function Stepper({
  steps,
  current,
  className,
}: {
  steps: string[];
  current: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {steps.map((label, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <div key={label} className={cn("flex items-center", !last && "flex-1")}>
            <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-colors duration-300",
                  done && "border-accent bg-accent text-accent-fg",
                  active && "border-accent bg-accent-soft text-accent",
                  !done && !active && "border-line-strong bg-elevated text-faint",
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[13px] font-medium whitespace-nowrap transition-colors",
                  active || done ? "text-ink" : "text-faint",
                )}
              >
                {label}
              </span>
            </div>
            {!last && (
              <div className="mx-3 h-px flex-1 overflow-hidden rounded-full bg-line-strong">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
