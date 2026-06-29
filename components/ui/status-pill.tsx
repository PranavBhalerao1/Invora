import { cn } from "@/lib/utils";
import type { Status } from "@/types/inventory";

const itemConfig: Record<Status, { label: string; dot: string; text: string; bg: string }> = {
  arrived: { label: "Arrived", dot: "bg-success", text: "text-success", bg: "bg-success-soft" },
  partial: { label: "Partial", dot: "bg-warning", text: "text-warning", bg: "bg-warning-soft" },
  pending: { label: "Pending", dot: "bg-faint", text: "text-muted", bg: "bg-subtle" },
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  const cfg = itemConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-[11px] font-medium",
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function ReceiptStatusPill({
  reimbursed,
  className,
}: {
  reimbursed: boolean;
  className?: string;
}) {
  const cfg = reimbursed
    ? { label: "Reimbursed", dot: "bg-success", text: "text-success", bg: "bg-success-soft" }
    : { label: "Pending", dot: "bg-warning", text: "text-warning", bg: "bg-warning-soft" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pr-2.5 pl-2 text-[11px] font-medium",
        cfg.bg,
        cfg.text,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}
