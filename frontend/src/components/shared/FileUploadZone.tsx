import { useRef, type ChangeEvent, type DragEvent } from 'react';
import { Upload } from 'lucide-react';
import { cn } from '../../lib/cn';

const DEFAULT_ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp';
const DEFAULT_MAX = 10 * 1024 * 1024;

export type FileUploadZoneProps = {
  readonly accept?: string;
  readonly maxSize?: number;
  readonly value?: File | null;
  readonly onChange: (file: File | null) => void;
  readonly error?: string;
};

export function FileUploadZone({
  accept = DEFAULT_ACCEPT,
  maxSize = DEFAULT_MAX,
  value,
  onChange,
  error,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function applyFile(file: File | undefined) {
    if (!file) return;
    if (file.size > maxSize) {
      onChange(null);
      return;
    }
    onChange(file);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    applyFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLButtonElement>) {
    event.preventDefault();
    applyFile(event.dataTransfer.files[0]);
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          'flex w-full cursor-pointer flex-col items-center rounded-lg border border-dashed border-ink-muted/40 bg-surface px-4 py-8 text-sm text-ink-muted hover:border-primary',
          error && 'border-danger',
        )}
      >
        <Upload className="mb-2 h-6 w-6" aria-hidden />
        {value ? (
          <span className="text-ink">{value.name}</span>
        ) : (
          <span>Seret file ke sini atau klik untuk unggah (max 10MB, PDF/JPG/PNG/WEBP)</span>
        )}
      </button>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      {error ? <p className="mt-1 text-xs text-danger">{error}</p> : null}
    </div>
  );
}
