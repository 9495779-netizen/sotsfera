import { useState } from 'react';
import { Bell } from 'lucide-react';
import { formatDateTime } from '@/utils/format';
import { cn } from '@/utils/cn';

interface Notification {
  id: string;
  message: string;
  sentAt: string;
  read: boolean;
}

interface NotificationBellProps {
  notifications?: Notification[];
  className?: string;
}

export function NotificationBell({ notifications = [], className }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-md p-2 hover:bg-accent"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-md border bg-popover shadow-lg">
          <div className="border-b px-4 py-2 text-sm font-semibold">
            Уведомления {unread > 0 && <span className="ml-1 text-xs text-muted-foreground">({unread} новых)</span>}
          </div>
          {notifications.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Нет уведомлений
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {notifications.slice(0, 5).map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'border-b px-4 py-3 text-sm last:border-none',
                    !n.read && 'bg-blue-50',
                  )}
                >
                  <p className="text-sm">{n.message}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDateTime(n.sentAt)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
