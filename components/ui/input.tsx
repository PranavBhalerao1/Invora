import * as React from 'react';
import { cn } from '@/lib/utils';

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full min-w-0 rounded-[10px] border-[1.5px] border-border bg-white px-4 text-[15px] text-foreground transition-all duration-150 outline-none',
        'placeholder:text-muted-foreground',
        'focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/10',
        'disabled:pointer-events-none disabled:opacity-50',
        'aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20',
        className
      )}
      {...props}
    />
  );
}

export { Input };
