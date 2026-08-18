import { useQuery } from '@tanstack/react-query';
import { fetchLanding } from '../../../../api/publik';
import { queryKeys } from '../../../../lib/queryKeys';
import {
  HeroSection,
  LayananSection,
  TentangSection,
  TestimoniSection,
  UstadzSection,
  PartnerSection,
  ArtikelSection,
  LokasiSection,
  CtaBanner,
  SeoSection,
  FloatingCta,
} from '../../components/landing';

export function LandingPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.publik.landing,
    queryFn: fetchLanding,
  });

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="h-32 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <p className="text-danger">
          Gagal memuat halaman. Silakan muat ulang. ({String(error)})
        </p>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <>
      <HeroSection slides={data.heroSlides} paketUnggulan={data.paketAktif[0]} />
      <LayananSection />
      <TentangSection />
      <TestimoniSection items={data.testimoni} />
      <UstadzSection list={data.ustadz} />
      <PartnerSection logos={data.partner} />
      <ArtikelSection items={data.artikel} />
      <LokasiSection items={data.lokasi} />
      <CtaBanner />
      <SeoSection />
      <FloatingCta />
    </>
  );
}
