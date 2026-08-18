import type { ReactNode } from 'react';

export type Breadcrumb = {
  readonly label: string;
  readonly href?: string;
};

export type PageHeaderProps = {
  readonly title: string;
  readonly breadcrumbs?: readonly Breadcrumb[];
  readonly actions?: ReactNode;
};

export function PageHeader({ title, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 ? (
          <nav className="mb-1 text-xs text-ink-muted" aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <span key={`${crumb.label}-${index}`}>
                {index > 0 ? <span className="mx-1">/</span> : null}
                {crumb.href ? (
                  <a href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </a>
                ) : (
                  <span>{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        ) : null}
        <h1 className="font-heading text-2xl font-bold text-ink">{title}</h1>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </header>
  );
}
