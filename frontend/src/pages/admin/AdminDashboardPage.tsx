import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: string | number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold">{value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: () => apiClient.get('/admin/metrics').then((r) => r.data),
  });

  const { data: dynamics } = useQuery({
    queryKey: ['admin-dynamics'],
    queryFn: () => apiClient.get('/admin/dynamics').then((r) => r.data as any[]),
  });

  const { data: orgs } = useQuery({
    queryKey: ['admin-orgs'],
    queryFn: () => apiClient.get('/organizations', { params: { limit: 10 } }).then((r) => r.data),
  });

  const chartData = (dynamics ?? []).map((d) => ({
    month: format(parseISO(d.month), 'MMM yyyy', { locale: ru }),
    count: parseInt(d.count),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Дашборд администратора</h2>
        <p className="text-sm text-muted-foreground">Обзор платформы</p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard label="Всего организаций" value={metrics?.totalOrgs ?? '—'} icon={Building2} color="bg-blue-100 text-blue-700" />
        <StatCard label="Активных" value={metrics?.activeOrgs ?? '—'} icon={TrendingUp} color="bg-green-100 text-green-700" />
        <StatCard label="Всего работников" value={metrics?.totalWorkers ?? '—'} icon={Users} color="bg-purple-100 text-purple-700" />
        <StatCard label="С просрочками" value="—" icon={AlertCircle} color="bg-red-100 text-red-700" />
      </div>

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">Динамика подключений</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-4 py-3">
          <h3 className="font-semibold">Организации</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Название</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ИНН</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тариф</th>
            </tr>
          </thead>
          <tbody>
            {(orgs?.items ?? []).map((org: any) => (
              <tr key={org.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{org.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{org.inn}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${org.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {org.isActive ? 'Активна' : 'Неактивна'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {org.plan?.maxWorkers} чел.
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
