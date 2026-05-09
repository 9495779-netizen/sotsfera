import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { Plus, FileText } from 'lucide-react';
import { DeadlineCell } from '@/components/shared/DeadlineCell';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmployeeSearch } from '@/components/shared/EmployeeSearch';
import type { Employee } from '@/types';
import { CONCLUSION_LABELS, EXAM_TYPE_LABELS } from '@/utils/format';

const HARMFUL_FACTORS = [
  'Шум', 'Вибрация', 'Пыль', 'Химические вещества', 'Работа на высоте',
  'Электробезопасность', 'Ионизирующее излучение', 'Тяжесть труда',
];

export default function MedicalPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [medOrg, setMedOrg] = useState('');
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['medical', page],
    queryFn: () => apiClient.get('/medical', { params: { page, limit: 20 } }).then((r) => r.data),
  });

  const createDirectionMutation = useMutation({
    mutationFn: (dto: any) => apiClient.post('/medical/directions', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medical'] });
      setShowModal(false);
      setSelectedEmployee(null);
      setMedOrg('');
      setSelectedFactors([]);
    },
  });

  const handleCreate = () => {
    if (!selectedEmployee) return;
    createDirectionMutation.mutate({
      employeeId: selectedEmployee.id,
      medicalOrg: medOrg,
      harmfulFactors: selectedFactors,
    });
  };

  const toggleFactor = (f: string) =>
    setSelectedFactors((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f],
    );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Медосмотры</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Создать направление
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Сотрудник</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Вид</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Следующий срок</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Заключение</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Документ</th>
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
              : (data?.items ?? []).map((record: any) => (
                  <tr key={record.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{record.employeeId}</td>
                    <td className="px-4 py-3">{EXAM_TYPE_LABELS[record.examType] ?? record.examType}</td>
                    <td className="px-4 py-3"><DeadlineCell date={record.nextDueAt} /></td>
                    <td className="px-4 py-3">
                      {record.conclusion ? (
                        <StatusBadge
                          status={record.conclusion === 'годен' ? 'ok' : record.conclusion === 'не годен' ? 'danger' : 'warning'}
                          label={CONCLUSION_LABELS[record.conclusion] ?? record.conclusion}
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {record.fileUrl ? (
                        <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                          <FileText className="h-3 w-3" /> Открыть
                        </button>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Создать направление на медосмотр</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Сотрудник</label>
                <EmployeeSearch value={selectedEmployee} onChange={setSelectedEmployee} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Медицинская организация</label>
                <input
                  type="text"
                  value={medOrg}
                  onChange={(e) => setMedOrg(e.target.value)}
                  placeholder="Наименование медорганизации"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Вредные факторы</label>
                <div className="grid grid-cols-2 gap-1.5">
                  {HARMFUL_FACTORS.map((f) => (
                    <label key={f} className="flex cursor-pointer items-center gap-2 rounded-md border p-2 hover:bg-accent">
                      <input
                        type="checkbox"
                        checked={selectedFactors.includes(f)}
                        onChange={() => toggleFactor(f)}
                        className="h-3.5 w-3.5"
                      />
                      <span className="text-xs">{f}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-md border px-4 py-2 text-sm hover:bg-accent"
                >
                  Отмена
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createDirectionMutation.isPending || !selectedEmployee}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createDirectionMutation.isPending ? 'Создание...' : 'Создать и сформировать PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
