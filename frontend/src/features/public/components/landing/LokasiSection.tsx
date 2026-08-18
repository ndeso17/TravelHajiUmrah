import { MapPin, Phone } from 'lucide-react';
import type { LokasiKantor } from '../../../../api/types';

type LokasiSectionProps = {
  readonly items: readonly LokasiKantor[];
};

export function LokasiSection({ items }: LokasiSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section id="lokasi" className="scroll-mt-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Kantor Kami</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
            Temukan Lokasi Terdekat
          </h2>
          <p className="mt-3 text-body">Kunjungi kantor kami untuk konsultasi langsung dengan tim kami.</p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((kantor) => (
            <article
              key={kantor.id}
              className="rounded-lg border border-surface-muted bg-surface p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-base font-bold text-ink">
                {kantor.isKantorPusat ? 'Kantor Pusat' : kantor.nama}
              </h3>
              <p className="mt-1 text-sm font-semibold text-primary">{kantor.kota}</p>
              <p className="mt-3 text-sm text-body">{kantor.alamat}</p>
              {kantor.noTelp ? (
                <a
                  href={`tel:${kantor.noTelp}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-light"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  {kantor.noTelp}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
