import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, X, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ImportExcelButtonProps {
  onImport: (file: File) => Promise<{ created: number; errors: string[] }>;
  className?: string;
}

export function ImportExcelButton({ onImport, className }: ImportExcelButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const wb = XLSX.read(ev.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);
      setPreview(rows.slice(0, 5));
    };
    reader.readAsBinaryString(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const res = await onImport(file);
      setResult(res);
      setPreview(null);
      setFile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={className}>
      <input ref={inputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFile} />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent',
        )}
      >
        <Upload className="h-4 w-4" />
        Импорт из Excel
      </button>

      {preview && file && (
        <div className="mt-3 rounded-md border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <FileSpreadsheet className="h-4 w-4 text-green-600" />
              {file.name} — предпросмотр первых {preview.length} строк
            </div>
            <button onClick={() => { setPreview(null); setFile(null); }}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  {Object.keys(preview[0] || {}).map((k) => (
                    <th key={k} className="py-1 pr-4 text-left font-medium text-muted-foreground">{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-b">
                    {Object.values(row).map((v, j) => (
                      <td key={j} className="py-1 pr-4">{String(v)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            onClick={handleImport}
            disabled={loading}
            className="mt-3 flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Импорт...' : 'Импортировать'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-2 rounded-md bg-green-50 p-3 text-sm">
          <div className="flex items-center gap-2 text-green-700">
            <Check className="h-4 w-4" />
            Создано записей: {result.created}
          </div>
          {result.errors.length > 0 && (
            <div className="mt-1 text-red-600">
              Ошибок: {result.errors.length}
              <ul className="mt-1 list-inside list-disc">
                {result.errors.slice(0, 3).map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
