"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Portal, useEscape, useScrollLock } from "./overlay";

export function Modal({
  open,
  onClose,
  children,
  className,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  useScrollLock(open);
  useEscape(open, onClose);

  const maxW = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <Portal>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
            <motion.div
              className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              className={cn(
                "relative w-full overflow-hidden rounded-t-2xl border border-line bg-elevated shadow-pop sm:rounded-2xl",
                maxW,
                className,
              )}
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 8 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}

export function ModalHeader({
  title,
  description,
  onClose,
  icon,
}: {
  title: string;
  description?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 p-6 pb-4">
      {icon && (
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-line bg-subtle">
          {icon}
        </div>
      )}
      <div className="flex-1 pt-0.5">
        <h2 className="text-base font-semibold tracking-tight text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="-mt-1 -mr-1 flex size-8 items-center justify-center rounded-lg text-faint transition-colors hover:bg-subtle hover:text-ink"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

export function ModalBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-2", className)} {...props} />;
}

export function ModalFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-2 flex items-center justify-end gap-2.5 border-t border-line bg-surface/60 px-6 py-4", className)}
      {...props}
    />
  );
}
