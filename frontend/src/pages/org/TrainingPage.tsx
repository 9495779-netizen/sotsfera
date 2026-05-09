import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useState } from 'react';
import { Plus, BookOpen, FileText } from 'lucide-react';
import { DeadlineCell } from '@/components/shared/DeadlineCell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { deadlineStatus } from '@/utils/format';

type TabId = 'programs' | 'records' | 'protocols';

export default function TrainingPage() {
  const [tab, setTab] = useState<TabId>('records');

  const { data: programs } = useQuery({
    queryKey: ['training-programs'],
    queryFn: () => apiClient.get('/training/programs').then((r) => r.data),
    enabled: tab === 'programs',
  });

  const { data: records, isLoading } = useQuery({
    queryKey: ['training-records'],
    queryFn: () => apiClient.get('/training/records').then((r) => r.data),
    enabled: tab === 'records',
  });

  const { data: protocols } = useQuery({
    queryKey: ['training-protocols'],
    queryFn: () => apiClient.get('/training/protocols').then((r) => r.data),
    enabled: tab === 'protocols',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Обучение</h2>
        <button className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" />
          {tab === 'programs' ? 'Программу' : tab === 'protocols' ? 'Протокол' : 'Запись'}
        </button>
      </div>

      <div className="flex gap-1 border-b">
        {[
          { id: 'records' as TabId, label: 'Записи об обучении', icon: BookOpen },
          { id: 'programs' as TabId, label: 'Программы', icon: FileText },
          { id: 'protocols' as TabId, label: 'Протоколы', icon: FileText },
        ].map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === id ? 'border-primary text-primary font-medium' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'records' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Сотрудник</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Программа</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Результат</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Срок удостоверения</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 4 }).map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-muted" /></td>
                    ))}</tr>
                  ))
                : (records?.items ?? []).map((r: any) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">{r.employeeId}</td>
                      <td className="px-4 py-3">{r.programId}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          status={r.result === 'сдал' ? 'ok' : r.result === 'не сдал' ? 'danger' : 'neutral'}
                          label={r.result ?? '—'}
                        />
                      </td>
                      <td className="px-4 py-3"><DeadlineCell date={r.nextDueAt} /></td>
                    </tr>
                  ))}
              {!isLoading && (records?.items ?? []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                    Нет записей об обучении
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'programs' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(programs ?? []).map((p: any) => (
            <div key={p.id} className="rounded-lg border bg-card p-4 shadow-sm">
              <h4 className="font-medium">{p.name}</h4>
              <p className="mt-1 text-xs text-muted-foreground">{p.topic}</p>
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                <span>{p.durationHours} ч.</span>
                <span>Действует: {p.validityMonths} мес.</span>
              </div>
            </div>
          ))}
          {(programs ?? []).length === 0 && (
            <p className="col-span-3 py-8 text-center text-muted-foreground">Нет программ обучения</p>
          )}
        </div>
      )}

      {tab === 'protocols' && (
        <div className="space-y-2">
          {(protocols ?? []).map((p: any) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
              <div>
                <p className="font-medium">Протокол от {p.date}</p>
                <p className="text-xs text-muted-foreground">
                  Членов комиссии: {p.commissionMembers?.length ?? 0}
                </p>
              </div>
              {p.fileUrl && (
                <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                  <FileText className="h-3 w-3" /> Открыть
                </button>
              )}
            </div>
          ))}
          {(protocols ?? []).length === 0 && (
            <p className="py-8 text-center text-muted-foreground">Нет протоколов</p>
          )}
        </div>
      )}
    </div>
  );
}
