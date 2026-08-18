import { Quote, Star, Youtube } from 'lucide-react';
import type { Testimoni } from '../../../../api/types';

type TestimoniSectionProps = {
  readonly items: readonly Testimoni[];
};

export function TestimoniSection({ items }: TestimoniSectionProps) {
  if (items.length === 0) {
    return null;
  }

  const featured = items[0];
  if (!featured) {
    return null;
  }

  return (
    <section id="testimoni" className="scroll-mt-24 bg-background">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Testimoni</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
          Pengalaman Nyata dari Jamaah Kami
        </h2>

        <div className="mt-10 rounded-lg bg-surface p-8 shadow-sm sm:p-12">
          <Quote className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
          <p className="mt-6 font-serif text-xl italic leading-relaxed text-ink sm:text-2xl">
            &ldquo;{featured.quote}&rdquo;
          </p>
          <p className="mt-6 font-heading text-base font-bold text-ink">{featured.namaJamaah}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {[featured.kota, featured.paket?.nama].filter(Boolean).join(' · ')}
          </p>
          {featured.rating ? (
            <div className="mt-3 flex items-center justify-center gap-1" aria-label={`Rating ${featured.rating} dari 5`}>
              {Array.from({ length: featured.rating }).map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
              ))}
            </div>
          ) : null}
        </div>

        <a
          href="https://youtube.com/@samiratravel"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light"
        >
          <Youtube className="h-5 w-5" aria-hidden="true" />
          @samiratravel
        </a>
      </div>
    </section>
  );
}
