"use client";

import * as React from "react";
import { createPortal } from "react-dom";

export function Portal({ children }: { children: React.ReactNode }) {
  const mounted = React.useSyncExternalStore(
    React.useCallback((onStoreChange) => {
      onStoreChange();
      return () => {};
    }, []),
    () => true,
    () => false,
  );
  if (!mounted || typeof document === "undefined") return null;
  return createPortal(children, document.body);
}

/** Lock body scroll while an overlay is open. */
export function useScrollLock(active: boolean) {
  React.useEffect(() => {
    if (!active) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [active]);
}

/** Call `onClose` when Escape is pressed. */
export function useEscape(active: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!active) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [active, onClose]);
}
