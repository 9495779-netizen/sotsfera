import { useQuery } from '@tanstack/react-query';
import {
  Users, AlertTriangle, Stethoscope, GraduationCap,
  ShieldCheck, ArrowRight, Plus,
} from 'lucide-react';
import { analyticsApi } from '@/api/analytics';
import { briefingsApi } from '@/api/briefings';
import { DeadlineCell } from '@/components/shared/DeadlineCell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { cn } from '@/utils/cn';
import { useNavigate } from 'react-router-dom';

function MetricCard({
  label, value, icon: Icon, variant = 'default',
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  variant?: 'default' | 'danger' | 'warning';
}) {
  const variantClass = {
    default: 'text-primary',
    danger: 'text-red-600',
    warning: 'text-yellow-600',
  }[variant];

  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('mt-1 text-3xl font-bold', variantClass)}>{value}</p>
        </div>
        <div className={cn('rounded-lg p-2.5', `bg-${variant === 'default' ? 'primary' : variant === 'danger' ? 'red' : 'yellow'}-100`)}>
          <Icon className={cn('h-5 w-5', variantClass)} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsApi.getDashboard,
  });

  const { data: upcoming, isLoading: upcomingLoading } = useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => analyticsApi.getUpcoming(10),
  });

  const { data: deptStatus } = useQuery({
    queryKey: ['dept-status'],
    queryFn: analyticsApi.getByDepartment,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Дашборд</h2>
        <p className="text-sm text-muted-foreground">Обзор состояния охраны труда организации</p>
      </div>

      {/* SummaryMetrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metricsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))
        ) : (
          <>
            <MetricCard
              label="Сотрудников"
              value={metrics?.totalEmployees ?? 0}
              icon={Users}
            />
            <MetricCard
              label="Инструктажей просрочено"
              value={metrics?.overduesBriefings ?? 0}
              icon={AlertTriangle}
              variant={metrics?.overduesBriefings ? 'danger' : 'default'}
            />
            <MetricCard
              label="Медосмотров истекает"
              value={metrics?.expiringMedical ?? 0}
              icon={Stethoscope}
              variant={metrics?.expiringMedical ? 'warning' : 'default'}
            />
            <MetricCard
              label="Обучение актуально"
              value={metrics?.validTraining ?? 0}
              icon={GraduationCap}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* UpcomingEvents */}
        <div className="lg:col-span-2 rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Ближайшие события</h3>
            <button
              onClick={() => navigate('/org/analytics')}
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Все <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {upcomingLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : upcoming && (upcoming as any[]).length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Тип</th>
                  <th className="pb-2 font-medium">Срок</th>
                </tr>
              </thead>
              <tbody>
                {(upcoming as any[]).map((event, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2.5">
                      <StatusBadge
                        status={event.type === 'briefing' ? 'warning' : 'danger'}
                        label={event.type === 'briefing' ? 'Инструктаж' : 'Медосмотр'}
                      />
                    </td>
                    <td className="py-2.5">
                      <DeadlineCell date={event.dueDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <ShieldCheck className="mb-2 h-8 w-8 text-green-500" />
              <p className="text-sm font-medium">Нет предстоящих событий</p>
              <p className="text-xs text-muted-foreground">Все сроки в норме</p>
            </div>
          )}
        </div>

        {/* QuickActions */}
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold">Быстрые действия</h3>
          <div className="space-y-2">
            {[
              { label: 'Провести инструктаж', path: '/org/briefings', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
              { label: 'Создать направление', path: '/org/medical', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
              { label: 'Сформировать журнал', path: '/org/briefings', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
              { label: 'Добавить сотрудника', path: '/org/employees', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
              { label: 'Создать приказ', path: '/org/orders', color: 'bg-gray-50 text-gray-700 hover:bg-gray-100' },
            ].map(({ label, path, color }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className={cn(
                  'flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
                  color,
                )}
              >
                {label}
                <Plus className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* StatusByDepartment */}
      {deptStatus && (deptStatus as any[]).length > 0 && (
        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <h3 className="mb-4 font-semibold">Статус по подразделениям</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Подразделение</th>
                  <th className="pb-2 font-medium text-center">Инструктажи</th>
                  <th className="pb-2 font-medium text-center">Медосмотры</th>
                  <th className="pb-2 font-medium text-center">Обучение</th>
                </tr>
              </thead>
              <tbody>
                {(deptStatus as any[]).map((row) => (
                  <tr key={row.deptId} className="border-b last:border-0">
                    <td className="py-2.5 font-medium">{row.deptName}</td>
                    <td className="py-2.5 text-center">
                      <StatusBadge
                        status={row.briefingOverdue > 0 ? 'danger' : 'ok'}
                        label={row.briefingOverdue > 0 ? `${row.briefingOverdue} просрочено` : 'В норме'}
                      />
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={row.medicalOverdue > 0 ? 'warning' : 'ok'} label="В норме" />
                    </td>
                    <td className="py-2.5 text-center">
                      <StatusBadge status={row.trainingOverdue > 0 ? 'warning' : 'ok'} label="В норме" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
