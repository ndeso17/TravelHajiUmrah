import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import type { Ustadz } from '../../../../api/types';

type UstadzSectionProps = {
  readonly list: readonly Ustadz[];
};

export function UstadzSection({ list }: UstadzSectionProps) {
  if (list.length === 0) {
    return null;
  }

  return (
    <section id="ustadz" className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Pembimbing</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">Kenali Ustadz Pembimbing</h2>
          <p className="mt-3 text-body">Pendampingan ibadah oleh para ustadz yang kompeten dan bersanad.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.slice(0, 4).map((ustadz) => (
            <article
              key={ustadz.id}
              className="overflow-hidden rounded-lg border border-surface-muted bg-surface text-center shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/20 to-gold/20">
                {ustadz.fotoUrl ? (
                  <img src={ustadz.fotoUrl} alt={ustadz.nama} className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <GraduationCap className="h-12 w-12 text-primary" aria-hidden="true" />
                )}
              </div>
              <div className="p-5">
                <h3 className="font-heading text-base font-bold text-ink">{ustadz.nama}</h3>
                {ustadz.gelar ? <p className="mt-1 text-xs font-semibold text-primary">{ustadz.gelar}</p> : null}
                <p className="mt-2 text-xs text-ink-muted">{ustadz.keahlian.slice(0, 2).join(' · ')}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/daftar" className="text-sm font-bold text-primary hover:text-primary-light">
            Lihat Lebih Banyak &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
