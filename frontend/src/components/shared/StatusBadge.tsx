import { cn } from '../../lib/cn';

const DEFAULT_VARIANT = {
  aktif: 'bg-success/15 text-success',
  pending: 'bg-warning/15 text-warning',
  lunas: 'bg-success/15 text-success',
  kurang: 'bg-danger/15 text-danger',
  expired: 'bg-ink-muted/15 text-ink-muted',
  menunggu: 'bg-warning/15 text-warning',
  verified: 'bg-success/15 text-success',
  rejected: 'bg-danger/15 text-danger',
  batal: 'bg-ink-muted/15 text-ink-muted',
} as const;

export type StatusBadgeProps = {
  readonly status: string;
  readonly mapping?: Readonly<Record<string, string>>;
  readonly className?: string;
};

export function StatusBadge({ status, mapping, className }: StatusBadgeProps) {
  const key = status.toLowerCase();
  const variant = mapping?.[key] ?? DEFAULT_VARIANT[key as keyof typeof DEFAULT_VARIANT] ?? 'bg-surface-muted text-ink';
  return (
    <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize', variant, className)}>
      {status.replaceAll('_', ' ').toLowerCase()}
    </span>
  );
}
