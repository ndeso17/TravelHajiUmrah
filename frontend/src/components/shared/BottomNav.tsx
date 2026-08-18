import { Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useScrollSpy, isNavItemActive } from './useScrollSpy';

export type BottomNavItem = {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
};

type BottomNavProps = {
  readonly items: readonly BottomNavItem[];
  readonly onMore?: () => void;
  readonly className?: string;
};

export function BottomNav({ items, onMore, className }: BottomNavProps) {
  const { activeKey, pathname } = useScrollSpy(items);

  return (
    <nav
      aria-label="Navigasi utama"
      className={cn(
        'fixed inset-x-0 bottom-0 z-40 border-t border-surface-muted bg-surface/95 backdrop-blur',
        className,
      )}
    >
      <div className="mx-auto flex max-w-5xl items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = isNavItemActive(item, activeKey, pathname);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-colors',
                active ? 'text-primary' : 'text-ink-muted hover:text-ink',
              )}
            >
              <span
                className={cn(
                  'flex items-center justify-center rounded-full px-4 py-1 transition-colors',
                  active && 'bg-primary/10',
                )}
              >
                <item.icon className={cn('h-5 w-5', active && 'stroke-[2.5]')} aria-hidden="true" />
              </span>
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
        {onMore ? (
          <button
            type="button"
            onClick={onMore}
            className="flex min-h-14 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-[10px] font-semibold text-ink-muted hover:text-ink"
          >
            <span className="flex items-center justify-center rounded-full px-4 py-1">
              <Menu className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="leading-none">Lainnya</span>
          </button>
        ) : null}
      </div>
    </nav>
  );
}