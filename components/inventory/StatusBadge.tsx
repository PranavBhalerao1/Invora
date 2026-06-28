import { Status } from '@/types/inventory';

const config: Record<Status, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-red-500/20 text-red-400 border border-red-500/30' },
  partial: { label: 'Partial', className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
  arrived: { label: 'Arrived', className: 'bg-green-500/20 text-green-400 border border-green-500/30' },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { label, className } = config[status];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors duration-300 ${className}`}>
      {label}
    </span>
  );
}
