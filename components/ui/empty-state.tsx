import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-16 text-center", className)}>
      <div className="relative mb-5">
        <div className="absolute inset-0 -z-10 rounded-2xl bg-accent/5 blur-xl" />
        <div className="flex size-14 items-center justify-center rounded-2xl border border-line bg-gradient-to-b from-subtle to-elevated shadow-xs">
          <Icon className="size-6 text-faint" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-muted text-balance">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
