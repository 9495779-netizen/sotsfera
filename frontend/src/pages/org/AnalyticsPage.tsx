import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/api/analytics';
import { Download, Filter } from 'lucide-react';
import { DeadlineCell } from '@/components/shared/DeadlineCell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { deadlineStatus } from '@/utils/format';

type Tab = 'briefings' | 'medical' | 'training' | 'employees';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('briefings');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const { data: upcoming } = useQuery({
    queryKey: ['analytics-upcoming'],
    queryFn: () => analyticsApi.getUpcoming(50),
  });

  const handleExport = async () => {
    const blob = await analyticsApi.exportBriefings(from || undefined, to || undefined);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `briefings_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TABS: Array<{ id: Tab; label: string }> = [
    { id: 'briefings', label: 'Инструктажи' },
    { id: 'medical', label: 'Медосмотры' },
    { id: 'training', label: 'Обучение' },
    { id: 'employees', label: 'Сотрудники' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Отчёты</h2>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          Экспорт Excel
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? 'border-primary text-primary font-medium'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex items-center gap-2 text-sm">
          <label className="text-muted-foreground">С:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          />
          <label className="text-muted-foreground">По:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded border border-input bg-background px-2 py-1 text-sm"
          />
        </div>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тип события</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Срок</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
            </tr>
          </thead>
          <tbody>
            {((upcoming as any[]) ?? []).length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-12 text-center text-muted-foreground">
                  Нет событий
                </td>
              </tr>
            ) : (
              ((upcoming as any[]) ?? []).map((event: any, i: number) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      event.type === 'briefing' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {event.type === 'briefing' ? 'Инструктаж' : 'Медосмотр'}
                    </span>
                  </td>
                  <td className="px-4 py-3"><DeadlineCell date={event.dueDate} /></td>
                  <td className="px-4 py-3">
                    <StatusBadge status={deadlineStatus(event.dueDate)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
