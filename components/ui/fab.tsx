"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Fab({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.94 }}
      className={cn(
        "group fixed right-5 bottom-5 z-30 flex h-13 items-center gap-2.5 rounded-full bg-accent pr-5 pl-4 text-accent-fg shadow-pop",
        "transition-[background] duration-200 hover:bg-accent-hover sm:right-8 sm:bottom-8",
        className,
      )}
      aria-label={label}
    >
      <span className="relative flex size-6 items-center justify-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={label}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.2 }}
          >
            <Icon className="size-5" strokeWidth={2.25} />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </motion.button>
  );
}
