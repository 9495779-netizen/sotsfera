import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useState } from 'react';
import { Plus, FileText, PenLine } from 'lucide-react';
import { formatDate } from '@/utils/format';

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: templates } = useQuery({
    queryKey: ['order-templates'],
    queryFn: () => apiClient.get('/orders/templates').then((r) => r.data),
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => apiClient.get('/orders').then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => apiClient.post('/orders', dto).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowNew(false);
      setOrderNumber('');
    },
  });

  const signMutation = useMutation({
    mutationFn: (id: string) => apiClient.post(`/orders/${id}/sign`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const ORDER_TYPE_LABELS: Record<string, string> = {
    стажировка: 'Стажировка',
    допуск: 'Допуск к работе',
    ответственный: 'Ответственный',
    комиссия: 'Комиссия',
    проверка_знаний: 'Проверка знаний',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Приказы</h2>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Создать приказ
        </button>
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Номер</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-muted" /></td>
                  ))}</tr>
                ))
              : (orders?.items ?? []).map((order: any) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">№ {order.number}</td>
                    <td className="px-4 py-3">{formatDate(order.date)}</td>
                    <td className="px-4 py-3">{ORDER_TYPE_LABELS[order.content?.type] ?? '—'}</td>
                    <td className="px-4 py-3">
                      {order.signedAt ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Подписан</span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">Черновик</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {order.fileUrl && (
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <FileText className="h-3 w-3" /> PDF
                          </button>
                        )}
                        {!order.signedAt && (
                          <button
                            onClick={() => signMutation.mutate(order.id)}
                            className="flex items-center gap-1 text-xs text-green-600 hover:underline"
                          >
                            <PenLine className="h-3 w-3" /> Подписать
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            {!isLoading && (orders?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Нет приказов
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold">Создать приказ</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Шаблон</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Выберите шаблон</option>
                  {(templates ?? []).map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Номер приказа</label>
                <input
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Например: 001-ОТ"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Дата</label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setShowNew(false)} className="rounded-md border px-4 py-2 text-sm hover:bg-accent">Отмена</button>
                <button
                  onClick={() => createMutation.mutate({ templateId: selectedTemplate, number: orderNumber, date: orderDate, content: {}, employees: [] })}
                  disabled={createMutation.isPending || !orderNumber}
                  className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Создание...' : 'Создать'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
