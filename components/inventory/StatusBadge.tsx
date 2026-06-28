import { Status } from '@/types/inventory';

const config: Record<Status, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className:
      'bg-destructive/10 text-destructive border border-destructive/20',
  },
  partial: {
    label: 'Partial',
    className: 'bg-warning/10 text-warning border border-warning/20',
  },
  arrived: {
    label: 'Arrived',
    className: 'bg-success/10 text-success border border-success/20',
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors ${className}`}
    >
      {label}
    </span>
  );
}
