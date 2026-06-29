"use client";

import * as React from "react";
import { Slot } from "radix-ui";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "danger"
  | "subtle"
  // backward-compatible aliases
  | "default"
  | "destructive"
  | "link";
type Size = "sm" | "md" | "lg" | "icon" | "icon-sm" | "default" | "xs" | "icon-lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg shadow-xs hover:bg-accent-hover active:bg-accent-hover",
  secondary: "bg-ink text-white shadow-xs hover:bg-ink-soft active:bg-ink-soft",
  outline:
    "border border-line-strong bg-elevated text-ink-soft shadow-xs hover:bg-subtle hover:text-ink",
  ghost: "text-ink-soft hover:bg-subtle hover:text-ink",
  subtle: "bg-subtle text-ink-soft hover:bg-line-strong/60 hover:text-ink",
  danger: "bg-danger text-white shadow-xs hover:brightness-95 active:brightness-90",
  // aliases
  default: "bg-accent text-accent-fg shadow-xs hover:bg-accent-hover active:bg-accent-hover",
  destructive: "bg-danger text-white shadow-xs hover:brightness-95 active:brightness-90",
  link: "text-accent underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-[13px]",
  md: "h-9.5 gap-2 rounded-lg px-4 text-sm",
  lg: "h-11 gap-2 rounded-lg px-5 text-[15px]",
  icon: "h-9.5 w-9.5 rounded-lg",
  "icon-sm": "h-8 w-8 rounded-lg",
  // aliases
  default: "h-9.5 gap-2 rounded-lg px-4 text-sm",
  xs: "h-7 gap-1 rounded-lg px-3 text-xs",
  "icon-lg": "h-11 w-11 rounded-lg",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", loading, asChild = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot.Root : "button";
    return (
      <Comp
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "relative inline-flex select-none items-center justify-center font-medium whitespace-nowrap",
          "transition-[background,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-accent/15 focus-visible:ring-offset-0",
          "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button as default };
