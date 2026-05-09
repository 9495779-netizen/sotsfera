import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Settings, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useAuth } from '@/hooks/useAuth';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/admin/organizations', icon: Building2, label: 'Организации' },
  { to: '/admin/users', icon: Users, label: 'Пользователи' },
  { to: '/admin/settings', icon: Settings, label: 'Настройки' },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-60 flex-col border-r bg-slate-900 text-slate-100">
        <div className="flex h-14 items-center border-b border-slate-700 px-4">
          <span className="text-sm font-bold text-white">ОТ-Сервис Admin</span>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-700 px-2 py-3">
          <div className="mb-2 px-3 text-xs text-slate-400">{user?.email}</div>
          <button
            onClick={async () => { await logout(); navigate('/auth/login'); }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center border-b bg-card px-6">
          <h1 className="text-sm font-semibold">Администрирование платформы</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-muted/30">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
