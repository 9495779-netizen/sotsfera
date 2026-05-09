import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, ShieldCheck, Stethoscope, GraduationCap,
  FileText, Archive, BarChart3, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';
import { NotificationBell } from '@/components/shared/NotificationBell';

const NAV_ITEMS = [
  { to: '/org/dashboard', icon: LayoutDashboard, label: 'Главная' },
  { to: '/org/employees', icon: Users, label: 'Сотрудники' },
  { to: '/org/briefings', icon: ShieldCheck, label: 'Инструктажи' },
  { to: '/org/medical', icon: Stethoscope, label: 'Медосмотры' },
  { to: '/org/training', icon: GraduationCap, label: 'Обучение' },
  { to: '/org/orders', icon: FileText, label: 'Приказы' },
  { to: '/org/documents', icon: Archive, label: 'Документы' },
  { to: '/org/analytics', icon: BarChart3, label: 'Отчёты' },
  { to: '/org/settings', icon: Settings, label: 'Настройки' },
];

export function OrgLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r bg-card transition-all duration-200',
          collapsed ? 'w-16' : 'w-60',
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 border-b">
          {!collapsed && (
            <span className="text-sm font-bold text-primary truncate">ОТ-Сервис</span>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="rounded-md p-1.5 hover:bg-accent ml-auto"
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  collapsed && 'justify-center',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="border-t px-2 py-3">
          <div className={cn('mb-2 px-2 text-xs text-muted-foreground', collapsed && 'hidden')}>
            {user?.email}
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              collapsed && 'justify-center',
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && 'Выйти'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center justify-between border-b bg-card px-6">
          <h1 className="text-sm font-semibold text-muted-foreground">
            Специалист по охране труда
          </h1>
          <NotificationBell />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
