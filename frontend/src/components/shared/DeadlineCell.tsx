import { formatDate, daysUntil, formatDaysLeft, deadlineStatus } from '@/utils/format';
import { cn } from '@/utils/cn';

interface DeadlineCellProps {
  date: string | undefined | null;
  className?: string;
}

export function DeadlineCell({ date, className }: DeadlineCellProps) {
  if (!date) return <span className="text-muted-foreground">—</span>;

  const days = daysUntil(date);
  const status = deadlineStatus(date);

  const colorClass = {
    ok: 'text-green-700',
    warning: 'text-yellow-700',
    danger: 'text-red-700',
    neutral: 'text-gray-500',
  }[status];

  return (
    <div className={cn('flex flex-col', className)}>
      <span className="text-sm">{formatDate(date)}</span>
      <span className={cn('text-xs font-medium', colorClass)}>
        {formatDaysLeft(days)}
      </span>
    </div>
  );
}
