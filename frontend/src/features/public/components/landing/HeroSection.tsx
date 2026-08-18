import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronDown, Phone } from 'lucide-react';
import type { HeroSlide, Paket } from '../../../../api/types';
import { buildHeroVideoUrl, fetchHeroVideoToken } from '../../../../api/publik';

type HeroSectionProps = {
  readonly slides: readonly HeroSlide[];
  readonly paketUnggulan?: Paket;
};

const TRUST = ['PIHK No.394/2021', 'PPIU No. U.533/2020', 'Akreditasi A', 'Anggota AMPHURI', 'Terdaftar LSU'] as const;

const DEFAULT_QUOTE = 'Sempurnakan niat dan perbanyak doa, semoga Allah mudahkan setiap langkah ibadah Anda.';

export function HeroSection({ slides, paketUnggulan }: HeroSectionProps) {
  const hero = slides[0];
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchHeroVideoToken()
      .then((token) => {
        if (!cancelled) setVideoUrl(buildHeroVideoUrl(token));
      })
      .catch(() => {
        if (!cancelled && hero?.videoUrl) setVideoUrl(hero.videoUrl);
      });
    return () => {
      cancelled = true;
    };
  }, [hero?.videoUrl]);

  const poster = hero?.gambarUrl ?? undefined;

  return (
    <section
      className="relative isolate -mt-[4.5rem] flex min-h-dvh flex-col justify-center overflow-hidden bg-primary-dark"
    >
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary-dark via-primary to-primary-light/70" aria-hidden="true" />

      {!videoUrl && poster ? (
        <img src={poster} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
      ) : null}

      {videoUrl ? (
        <video
          key={videoUrl}
          className={`absolute inset-0 -z-10 h-full w-full object-cover transition-opacity duration-700 ${
            videoReady ? 'opacity-100' : 'opacity-0'
          }`}
          src={videoUrl}
          poster={poster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-hidden="true"
          onCanPlay={() => setVideoReady(true)}
          onError={() => {
            setVideoUrl(null);
            setVideoReady(false);
          }}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : null}

      <div className="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-black/30 to-transparent" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/50 to-transparent" aria-hidden="true" />

      <div className="mx-auto flex w-full max-w-7xl flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8">
        <blockquote className="max-w-2xl border-l-2 border-gold pl-4">
          <p className="font-serif text-[clamp(1rem,2.5vw,1.25rem)] italic text-gold-light">
            &ldquo;{hero?.quote ?? DEFAULT_QUOTE}&rdquo;
          </p>
        </blockquote>

        <h1 className="mt-6 max-w-3xl font-heading text-[clamp(1.75rem,5vw,3.5rem)] font-bold leading-tight text-white">
          {hero?.judul ?? 'Travel Haji, Umroh dan Halal Tours'}
        </h1>

        <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          Berizin resmi Kemenag dengan pendampingan ustadz bersanad. Umroh dulu bayar lunas nanti — wujudkan niat
          ibadah Anda sekarang, pelunasan menyusul.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link to="/daftar" className="cta-pill text-sm">
            Lihat Paket
          </Link>
          {paketUnggulan ? (
            <Link
              to={`/paket/${paketUnggulan.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold px-7 py-4 text-sm font-bold text-gold-light transition-colors duration-200 hover:bg-gold hover:text-[#361f12]"
            >
              Paket Unggulan
            </Link>
          ) : (
            <a
              href="tel:081234567890"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold px-7 py-4 text-sm font-bold text-gold-light transition-colors duration-200 hover:bg-gold hover:text-[#361f12]"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              Konsultasi Gratis
            </a>
          )}
        </div>

        <ul className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
          {TRUST.map((item) => (
            <li key={item} className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
              <BadgeCheck className="h-4 w-4 text-gold" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <a
        href="#layanan"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/60 transition-colors duration-200 hover:text-white sm:block"
        aria-label="Gulir ke layanan"
      >
        <ChevronDown className="h-6 w-6 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
