import type { Status } from '~/lib/types';

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colors: Record<Status, string> = {
    active: 'bg-red-100 text-red-800',
    verified: 'bg-green-100 text-green-800',
    disputed: 'bg-gray-100 text-gray-800',
    resolved: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status}
    </span>
  );
}