import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/shared/NotificationBell';

export function WorkerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-muted/20">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 shadow-sm">
        <span className="text-sm font-bold text-primary">ОТ-Сервис</span>
        <div className="flex items-center gap-3">
          <NotificationBell />
          <span className="text-xs text-muted-foreground hidden sm:block">{user?.email}</span>
          <button
            onClick={async () => { await logout(); navigate('/auth/login'); }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
