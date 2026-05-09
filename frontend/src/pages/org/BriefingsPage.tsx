import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Download } from 'lucide-react';
import { briefingsApi } from '@/api/briefings';
import { DeadlineCell } from '@/components/shared/DeadlineCell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeSearch } from '@/components/shared/EmployeeSearch';
import type { Employee, BriefingStatus } from '@/types';
import { formatDate } from '@/utils/format';
import { deadlineStatus } from '@/utils/format';

const conductSchema = z.object({
  typeId: z.string().min(1, 'Выберите тип'),
  conductedAt: z.string().min(1, 'Укажите дату'),
});

type ConductFormData = z.infer<typeof conductSchema>;

const BRIEFING_TYPE_OPTIONS = [
  { id: 'induction', label: 'Вводный' },
  { id: 'primary', label: 'Первичный' },
  { id: 'repeated', label: 'Повторный' },
  { id: 'unplanned', label: 'Внеплановый' },
  { id: 'targeted', label: 'Целевой' },
];

export default function BriefingsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [statusFilter, setStatusFilter] = useState<BriefingStatus | ''>('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['briefings', statusFilter, page],
    queryFn: () => briefingsApi.getRecords({ status: statusFilter || undefined, page, limit: 20 }),
  });

  const conductMutation = useMutation({
    mutationFn: (dto: any) => briefingsApi.conduct(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['briefings'] });
      setShowModal(false);
      reset();
      setSelectedEmployee(null);
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ConductFormData>({
    resolver: zodResolver(conductSchema),
    defaultValues: { conductedAt: new Date().toISOString().split('T')[0] },
  });

  const onConduct = (formData: ConductFormData) => {
    if (!selectedEmployee) return;
    conductMutation.mutate({
      employeeId: selectedEmployee.id,
      typeId: formData.typeId,
      conductedAt: new Date(formData.conductedAt).toISOString(),
    });
  };

  const statusOptions: Array<{ value: BriefingStatus | ''; label: string }> = [
    { value: '', label: 'Все статусы' },
    { value: 'запланирован', label: 'Запланированные' },
    { value: 'проведён', label: 'Проведённые' },
    { value: 'просрочен', label: 'Просроченные' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Инструктажи</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => briefingsApi.createJournal({
              journalType: 'вводный',
              periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
              periodEnd: new Date().toISOString().split('T')[0],
            })}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Сформировать журнал
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Провести инструктаж
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {statusOptions.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => { setStatusFilter(value); setPage(1); }}
            className={`rounded-full border px-3 py-1 text-xs transition-colors ${
              statusFilter === value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'hover:bg-accent'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left">
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Сотрудник</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Тип</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Дата проведения</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Следующий срок</th>
              <th className="px-4 py-3 text-xs font-medium text-muted-foreground">Статус</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              : (data?.items ?? []).length === 0
              ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    Записи не найдены
                  </td>
                </tr>
              )
              : (data?.items ?? []).map((record) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{record.employeeId}</td>
                    <td className="px-4 py-3">{record.typeId}</td>
                    <td className="px-4 py-3">{formatDate(record.conductedAt)}</td>
                    <td className="px-4 py-3">
                      <DeadlineCell date={record.nextDueAt} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={
                          record.status === 'просрочен' ? 'danger'
                          : record.status === 'проведён' ? 'ok'
                          : deadlineStatus(record.nextDueAt)
                        }
                        label={record.status}
                      />
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {/* Модальное окно "Провести инструктаж" */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Провести инструктаж</h3>
            <form onSubmit={handleSubmit(onConduct)} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Сотрудник</label>
                <EmployeeSearch
                  value={selectedEmployee}
                  onChange={setSelectedEmployee}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Тип инструктажа</label>
                <select
                  {...register('typeId')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Выберите тип</option>
                  {BRIEFING_TYPE_OPTIONS.map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                {errors.typeId && <p className="mt-1 text-xs text-destructive">{errors.typeId.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Дата проведения</label>
                <input
                  {...register('conductedAt')}
                  type="date"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={conductMutation.isPending || !selectedEmployee}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {conductMutation.isPending ? 'Сохранение...' : 'Провести'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
