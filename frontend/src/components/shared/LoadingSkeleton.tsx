import { cn } from '../../lib/cn';

export type LoadingSkeletonProps = {
  readonly rows?: number;
  readonly variant?: 'table' | 'card' | 'form';
  readonly className?: string;
};

function Bar({ className }: { readonly className?: string }) {
  return <div className={cn('animate-pulse rounded bg-surface-muted', className)} />;
}

export function LoadingSkeleton({ rows = 4, variant = 'table', className }: LoadingSkeletonProps) {
  if (variant === 'card') {
    return (
      <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="rounded-lg bg-surface p-4 shadow-sm">
            <Bar className="mb-3 h-32" />
            <Bar className="h-4 w-2/3" />
            <Bar className="mt-2 h-3 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'form') {
    return (
      <div className={cn('space-y-4', className)}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i}>
            <Bar className="mb-2 h-3 w-24" />
            <Bar className="h-10 w-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Memuat">
      {Array.from({ length: rows }, (_, i) => (
        <Bar key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
