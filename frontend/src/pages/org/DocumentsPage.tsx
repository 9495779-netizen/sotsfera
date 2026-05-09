import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/client';
import { useState, useRef } from 'react';
import { Upload, FileText, Search, ExternalLink } from 'lucide-react';
import { formatDate } from '@/utils/format';
import { DocumentPreview } from '@/components/shared/DocumentPreview';

export default function DocumentsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [previewDoc, setPreviewDoc] = useState<{ title: string; url: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['documents', search, page],
    queryFn: () =>
      apiClient.get('/documents', { params: { search, page, limit: 20 } }).then((r) => r.data),
  });

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', file.name);
    fd.append('docType', 'manual');
    await apiClient.post('/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    refetch();
  };

  const handleOpen = async (docId: string, title: string) => {
    const { data: url } = await apiClient.get(`/documents/${docId}/url`);
    setPreviewDoc({ title, url });
  };

  const DOC_TYPE_LABELS: Record<string, string> = {
    briefing_journal: 'Журнал инструктажей',
    med_direction: 'Направление на медосмотр',
    knowledge_protocol: 'Протокол знаний',
    order: 'Приказ',
    manual: 'Загружен вручную',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Документы</h2>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
          >
            <Upload className="h-4 w-4" />
            Загрузить скан
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring max-w-sm"
        />
      </div>

      <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Документ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тип</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Дата</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 4 }).map((__, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-muted" /></td>
                  ))}</tr>
                ))
              : (data?.items ?? []).map((doc: any) => (
                  <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium truncate max-w-xs">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {DOC_TYPE_LABELS[doc.docType] ?? doc.docType}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3">
                      {doc.fileUrl && (
                        <button
                          onClick={() => handleOpen(doc.id, doc.title)}
                          className="flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Открыть
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            {!isLoading && (data?.items ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  Документы не найдены
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {previewDoc && (
        <DocumentPreview
          title={previewDoc.title}
          url={previewDoc.url}
          onClose={() => setPreviewDoc(null)}
          canSign
        />
      )}
    </div>
  );
}
