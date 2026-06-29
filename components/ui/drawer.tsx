"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal, useEscape, useScrollLock } from "./overlay";

export function Drawer({
  open,
  onClose,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useScrollLock(open);
  useEscape(open, onClose);

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              className={cn(
                "absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-elevated shadow-pop",
                className,
              )}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function DrawerHeader({
  children,
  onClose,
  className,
}: {
  children: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6", className)}>
      <div className="min-w-0 flex-1">{children}</div>
      <button
        onClick={onClose}
        aria-label="Close"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-faint transition-colors hover:bg-subtle hover:text-ink"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function DrawerBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-y-auto p-5 sm:p-6", className)} {...props} />;
}

export function DrawerFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center gap-2.5 border-t border-line bg-surface/60 p-5 sm:px-6", className)}
      {...props}
    />
  );
}
