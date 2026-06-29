"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = "Select",
  className,
  align = "left",
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  align?: "left" | "right";
  /** Optional leading label rendered inside the trigger, e.g. "Sort:" */
  label?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex h-9.5 w-full items-center justify-between gap-2 rounded-lg border border-line-strong bg-elevated px-3 text-[13px] shadow-xs transition-colors",
          "hover:bg-subtle focus-visible:border-accent/60 focus-visible:ring-[3px] focus-visible:ring-accent/12 focus-visible:outline-none",
          open && "border-accent/60 ring-[3px] ring-accent/12",
        )}
      >
        <span className="flex items-center gap-1.5 truncate">
          {label && <span className="text-faint">{label}</span>}
          <span className={cn("font-medium", selected ? "text-ink" : "text-faint")}>
            {selected ? selected.label : placeholder}
          </span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-faint" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "absolute z-40 mt-1.5 min-w-full overflow-hidden rounded-xl border border-line bg-elevated p-1 shadow-pop",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-[13px] whitespace-nowrap transition-colors",
                    active ? "bg-subtle font-medium text-ink" : "text-ink-soft hover:bg-subtle",
                  )}
                >
                  {opt.label}
                  {active && <Check className="size-3.5 text-accent" strokeWidth={2.5} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
