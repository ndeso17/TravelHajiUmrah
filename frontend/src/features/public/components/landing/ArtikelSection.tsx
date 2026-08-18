import { Link } from 'react-router-dom';
import { CalendarDays } from 'lucide-react';
import type { Artikel } from '../../../../api/types';

type ArtikelSectionProps = {
  readonly items: readonly Artikel[];
};

export function ArtikelSection({ items }: ArtikelSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="artikel" className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Artikel</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">Wawasan Seputar Ibadah</h2>
          </div>
          <Link to="/daftar" className="text-sm font-bold text-primary hover:text-primary-light">
            Baca artikel lainnya &rarr;
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 3).map((artikel) => (
            <article
              key={artikel.id}
              className="overflow-hidden rounded-lg border border-surface-muted bg-surface shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              {artikel.coverUrl ? (
                <img src={artikel.coverUrl} alt="" className="h-44 w-full object-cover" />
              ) : (
                <div className="h-44 w-full bg-gradient-to-br from-primary/20 to-gold/20" aria-hidden="true" />
              )}
              <div className="p-5">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {artikel.kategori}
                </span>
                <h3 className="mt-3 font-heading text-base font-bold leading-snug text-ink">{artikel.judul}</h3>
                {artikel.excerpt ? <p className="mt-2 text-sm text-ink-muted line-clamp-2">{artikel.excerpt}</p> : null}
                <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  {new Date(artikel.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
