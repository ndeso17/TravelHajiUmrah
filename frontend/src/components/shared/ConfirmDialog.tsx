import { cn } from '../../lib/cn';

export type ConfirmDialogProps = {
  readonly open: boolean;
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
  readonly danger?: boolean;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
        <h2 id="confirm-title" className="font-heading text-lg font-semibold text-ink">
          {title}
        </h2>
        {description ? <p className="mt-2 text-sm text-body">{description}</p> : null}
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="cursor-pointer rounded-md px-4 py-2 text-sm text-ink hover:bg-surface-muted">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'cursor-pointer rounded-md px-4 py-2 text-sm font-semibold text-white',
              danger ? 'bg-danger hover:bg-danger/90' : 'bg-primary hover:bg-primary-light',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
