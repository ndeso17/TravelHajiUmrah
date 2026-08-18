import type { PartnerLogo } from '../../../../api/types';

type PartnerSectionProps = {
  readonly logos: readonly PartnerLogo[];
};

const FALLBACK_LOGOS: readonly string[] = [
  'Saudi Airlines',
  'Garuda Indonesia',
  'Ethihad Airways',
  'Emirates',
  'Hilton Makkah',
  'Swissotel Makkah',
  'Makkah Clock Tower',
  'Al Safwah Hotel',
  'Pullman Zamzam',
  'Nusuk',
  'AMPHURI',
  'LSU',
];

export function PartnerSection({ logos }: PartnerSectionProps) {
  const names = logos.length > 0 ? logos.map((logo) => logo.nama) : FALLBACK_LOGOS;
  const doubled = [...names, ...names];

  return (
    <section id="partner" className="overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center font-heading text-xl font-bold text-ink sm:text-2xl">
          Bekerjasama dengan 50+ Partner Lokal dan Global
        </h2>

        <div className="relative mt-10 overflow-hidden" aria-hidden="true">
          <div className="animate-marquee flex w-max gap-10">
            {doubled.map((name, idx) => (
              <span
                key={`${name}-${idx}`}
                className="whitespace-nowrap font-heading text-lg font-bold text-ink-muted/60"
              >
                {name}
              </span>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}
