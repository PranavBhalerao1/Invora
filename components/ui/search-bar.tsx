"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  kbd,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  kbd?: string;
}) {
  return (
    <div
      className={cn(
        "group relative flex h-10 items-center rounded-lg border border-line-strong bg-elevated shadow-xs",
        "transition-[box-shadow,border-color] duration-150",
        "focus-within:border-accent/60 focus-within:ring-[3px] focus-within:ring-accent/12",
        className,
      )}
    >
      <Search className="pointer-events-none absolute left-3 size-4 text-faint transition-colors group-focus-within:text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full w-full bg-transparent pr-9 pl-9 text-sm text-ink outline-none placeholder:text-faint"
      />
      {value ? (
        <button
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 flex size-5 items-center justify-center rounded-md text-faint hover:bg-subtle hover:text-ink-soft"
        >
          <X className="size-3.5" />
        </button>
      ) : (
        kbd && (
          <kbd className="absolute right-2.5 hidden h-5 items-center rounded-md border border-line-strong bg-subtle px-1.5 font-mono text-[10px] text-faint sm:inline-flex">
            {kbd}
          </kbd>
        )
      )}
    </div>
  );
}
