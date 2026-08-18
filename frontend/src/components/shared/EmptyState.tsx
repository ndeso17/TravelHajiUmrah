import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly icon?: LucideIcon;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, icon: Icon = Inbox, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-muted/30 bg-surface px-6 py-12 text-center">
      <Icon className="mb-3 h-10 w-10 text-ink-muted" aria-hidden />
      <h3 className="font-heading text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
