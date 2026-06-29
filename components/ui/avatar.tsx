import { cn, initials, tintFor } from "@/lib/utils";

const sizeMap = {
  xs: "size-6 text-[10px]",
  sm: "size-7 text-[11px]",
  md: "size-9 text-[13px]",
  lg: "size-11 text-sm",
};

export function Avatar({
  name,
  size = "md",
  className,
  ring = true,
}: {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
  ring?: boolean;
}) {
  const label = name?.trim() || "?";
  return (
    <span
      title={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white",
        tintFor(label),
        sizeMap[size],
        ring && "ring-2 ring-canvas",
        className,
      )}
    >
      {initials(label)}
    </span>
  );
}

export function AvatarGroup({
  names,
  max = 4,
  size = "md",
  className,
}: {
  names: string[];
  max?: number;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;

  return (
    <div className={cn("flex items-center -space-x-2", className)}>
      {shown.map((name, i) => (
        <Avatar key={`${name}-${i}`} name={name} size={size} />
      ))}
      {extra > 0 && (
        <span
          className={cn(
            "inline-flex shrink-0 items-center justify-center rounded-full bg-subtle font-semibold text-muted ring-2 ring-canvas",
            sizeMap[size],
          )}
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
