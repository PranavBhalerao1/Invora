import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'group/button inline-flex shrink-0 items-center justify-center gap-2 border border-transparent font-semibold whitespace-nowrap transition-all duration-150 outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-4',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground hover:bg-[#4338ca] active:bg-primary/95 shadow-[0_1px_3px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_12px_rgba(79,70,229,0.25)]',
        outline:
          'border-[1.5px] border-border bg-white text-foreground hover:border-primary/50 hover:text-primary',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/70',
        ghost:
          'hover:bg-muted hover:text-foreground text-muted-foreground',
        destructive:
          'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-11 px-6 text-[15px] rounded-[10px]',
        sm: 'h-9 px-4 text-sm rounded-lg',
        lg: 'h-12 px-8 text-[15px] rounded-[10px]',
        icon: 'size-11 rounded-[10px]',
        'icon-sm': 'size-9 rounded-lg',
        'icon-lg': 'size-11 rounded-[10px]',
        xs: 'h-7 px-3 text-xs rounded-lg gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
