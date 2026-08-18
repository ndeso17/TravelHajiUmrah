import { Link } from 'react-router-dom';

const MANFAAT: readonly string[] = [
  'Ibadah lebih khusyuk karena seluruh logistik diurus tim profesional.',
  'Bimbingan manasik berulang sebelum keberangkatan hingga bekal di tanah suci.',
  'Ustadz pembimbing bersanad mendampingi selama perjalanan.',
  'Biaya transparan dengan skema pembayaran yang fleksibel.',
  'Dokumen perjalanan diurus tuntas, dari paspor hingga visa.',
];

export function SeoSection() {
  return (
    <section id="seo" className="bg-background">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-widest text-primary">Mengapa Kami</p>
        <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
          Mengapa Ibadah Bersama Travel Haji dan Umroh?
        </h2>

        <div className="mt-6 space-y-4 text-body">
          <p>
            Menunaikan ibadah haji dan umroh adalah perjalanan yang membutuhkan persiapan matang. Memilih travel yang
            berizin resmi menjadi langkah pertama yang krusial untuk memastikan ibadah Anda berjalan lancar, aman, dan
            sesuai syariat.
          </p>
          <p>
            Kami berkomitmen menjaga setiap jamaah sejak pendaftaran hingga kembali ke tanah air. Dengan pengalaman
            panjang dan jaringan mitra di Arab Saudi, seluruh kebutuhan Anda kami uruskan dengan penuh tanggung jawab.
          </p>
        </div>

        <ol className="mt-8 space-y-4">
          {MANFAAT.map((item, index) => (
            <li key={item} className="flex items-start gap-4">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary">
                {index + 1}
              </span>
              <span className="text-body">{item}</span>
            </li>
          ))}
        </ol>

        <div className="mt-10 rounded-lg border border-surface-muted bg-surface p-6">
          <p className="font-heading text-base font-bold text-ink">Konsultasi dengan travel terdekat</p>
          <p className="mt-2 text-sm text-body">
            Hubungi kantor kami di kota Anda untuk jadwal keberangkatan dan paket terbaru.
          </p>
          <Link to="/daftar" className="cta-pill mt-5 inline-block text-sm">
            Mulai Konsultasi
          </Link>
        </div>
      </div>
    </section>
  );
}
