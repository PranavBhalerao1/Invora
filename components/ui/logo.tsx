import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  wordmark = "SSV Camp",
}: {
  className?: string;
  showWordmark?: boolean;
  wordmark?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex size-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent to-indigo-600 shadow-sm">
        <span className="absolute inset-0 rounded-[10px] ring-1 ring-inset ring-white/15" />
        <svg viewBox="0 0 24 24" className="size-4.5 text-white" fill="none">
          <path
            d="M5 7.5 12 4l7 3.5M5 7.5v9L12 20m-7-12.5L12 11m0 9 7-3.5v-9M12 20v-9m7-3.5L12 11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[17px] font-semibold tracking-tight text-ink">{wordmark}</span>
      )}
    </span>
  );
}
