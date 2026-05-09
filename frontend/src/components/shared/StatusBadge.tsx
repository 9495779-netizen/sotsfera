import { cn } from '@/utils/cn';
import type { StatusType } from '@/types';
import { CheckCircle2, AlertTriangle, XCircle, Minus } from 'lucide-react';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  className?: string;
}

const config: Record<StatusType, { icon: React.ElementType; classes: string; defaultLabel: string }> = {
  ok: { icon: CheckCircle2, classes: 'bg-green-100 text-green-800', defaultLabel: 'В норме' },
  warning: { icon: AlertTriangle, classes: 'bg-yellow-100 text-yellow-800', defaultLabel: 'Внимание' },
  danger: { icon: XCircle, classes: 'bg-red-100 text-red-800', defaultLabel: 'Просрочено' },
  neutral: { icon: Minus, classes: 'bg-gray-100 text-gray-600', defaultLabel: 'Нет данных' },
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  const { icon: Icon, classes, defaultLabel } = config[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        classes,
        className,
      )}
    >
      <Icon className="h-3 w-3" />
      {label ?? defaultLabel}
    </span>
  );
}
