import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status =
  | 'DETECTED'
  | 'ANALYZING'
  | 'CONFIRMED'
  | 'TAKEDOWN_REQUESTED'
  | 'RESOLVED'
  | 'FALSE_POSITIVE';

const severityConfig: Record<Severity, { label: string; className: string }> = {
  CRITICAL: { label: '● Crítica', className: 'bg-red-100 text-red-700 border-red-200' },
  HIGH: { label: '● Alta', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  MEDIUM: { label: '● Media', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  LOW: { label: '● Baja', className: 'bg-green-100 text-green-700 border-green-200' },
};

const statusConfig: Record<Status, { label: string; className: string }> = {
  DETECTED: { label: 'Detectada', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  ANALYZING: { label: 'Analizando', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  CONFIRMED: { label: 'Confirmada', className: 'bg-red-100 text-red-700 border-red-200' },
  TAKEDOWN_REQUESTED: {
    label: 'Takedown',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  RESOLVED: { label: 'Resuelta', className: 'bg-green-100 text-green-700 border-green-200' },
  FALSE_POSITIVE: {
    label: 'Falso positivo',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  const config = severityConfig[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
