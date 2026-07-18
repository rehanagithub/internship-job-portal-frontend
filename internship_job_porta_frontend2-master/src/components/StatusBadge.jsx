import { cn, statusColor } from '../lib/utils.js';

export default function StatusBadge({ status, className = '' }) {
  const label = status?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || '';
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', statusColor(status), className)}>
      {label}
    </span>
  );
}
