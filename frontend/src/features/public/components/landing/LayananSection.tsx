import { Link } from 'react-router-dom';
import { Plane, MoonStar, Globe2, HeartHandshake, ShieldCheck, PiggyBank } from 'lucide-react';

type Layanan = {
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly icon: typeof Plane;
};

const LAYANAN: readonly Layanan[] = [
  { title: 'Haji', description: 'Bimbingan manasik lengkap bersama ustadz bersanad hingga pelunasan.', href: '/daftar', icon: Plane },
  { title: 'Umroh', description: 'Paket umroh reguler, plus, dan rame-rame dengan harga transparan.', href: '/daftar', icon: MoonStar },
  { title: 'Jelajah Dunya', description: 'Halal tours ke destinasi wisata halal dunia dengan fasilitas premium.', href: '/daftar', icon: Globe2 },
  { title: 'Badal Haji', description: 'Layanan badal haji untuk mereka yang telah berhalangan secara syar\u2019i.', href: '/daftar', icon: HeartHandshake },
  { title: 'Badal Umroh', description: 'Mewakilkan ibadah umroh untuk keluarga yang sudah wafat.', href: '/daftar', icon: ShieldCheck },
  { title: 'Tabungan Umroh', description: 'Rencanakan keberangkatan ibadah Anda dengan cicilan ringan dan pasti.', href: '/daftar', icon: PiggyBank },
];

export function LayananSection() {
  return (
    <section id="layanan" className="scroll-mt-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-primary">Layanan Kami</p>
          <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
            Berbagai Layanan di Satu Tempat
          </h2>
          <p className="mt-3 text-body">
            Dari pendaftaran hingga kepulangan, seluruh kebutuhan ibadah Anda kami uruskan dalam satu pintu.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {LAYANAN.map(({ title, description, href, icon: Icon }) => (
            <Link
              key={title}
              to={href}
              className="group rounded-lg border border-surface-muted bg-surface p-6 shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md"
            >
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                <Icon className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-heading text-lg font-bold text-ink">{title}</h3>
              <p className="mt-2 text-sm text-body">{description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary">
                Lihat Selengkapnya
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">
                  &rarr;
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
