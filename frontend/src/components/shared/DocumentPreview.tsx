import { useState } from 'react';
import { Download, X, FileText, PenLine } from 'lucide-react';

interface DocumentPreviewProps {
  title: string;
  url: string;
  onClose: () => void;
  onSign?: () => void;
  canSign?: boolean;
}

export function DocumentPreview({ title, url, onClose, onSign, canSign }: DocumentPreviewProps) {
  const [signed, setSigned] = useState(false);

  const handleSign = () => {
    onSign?.();
    setSigned(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex h-[90vh] w-[90vw] max-w-5xl flex-col rounded-lg bg-background shadow-xl">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium">{title}</span>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={url}
              download
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              <Download className="h-4 w-4" />
              Скачать
            </a>
            {canSign && !signed && (
              <button
                onClick={handleSign}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
              >
                <PenLine className="h-4 w-4" />
                Подписать
              </button>
            )}
            {signed && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                Подписано
              </span>
            )}
            <button onClick={onClose} className="rounded-md p-1.5 hover:bg-accent">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <iframe src={url} className="h-full w-full border-none" title={title} />
        </div>
      </div>
    </div>
  );
}
