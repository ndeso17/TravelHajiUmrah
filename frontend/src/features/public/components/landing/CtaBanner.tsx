import { Link } from 'react-router-dom';

type CtaBannerProps = {
  readonly title?: string;
  readonly subtitle?: string;
  readonly ctaLabel?: string;
  readonly href?: string;
};

export function CtaBanner({
  title = 'Masih ada pertanyaan?',
  subtitle = 'Tim kami siap membantu Anda merencanakan perjalanan ibadah yang tenang dan berkah.',
  ctaLabel = 'Konsultasi Gratis',
  href = '/daftar',
}: CtaBannerProps) {
  return (
    <section className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 rounded-lg bg-gradient-to-r from-primary to-primary-dark px-6 py-12 text-center sm:px-12">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2" aria-hidden="true">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-dark bg-gold/30 font-heading text-sm font-bold text-[#361f12]">
                A
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-dark bg-gold-light/40 font-heading text-sm font-bold text-[#361f12]">
                R
              </span>
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary-dark bg-gold/50 font-heading text-sm font-bold text-[#361f12]">
                J
              </span>
            </div>
          </div>
          <div>
            <h2 className="font-heading text-2xl font-bold text-white">{title}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85">{subtitle}</p>
          </div>
          <Link to={href} className="cta-pill text-sm">
            {ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
