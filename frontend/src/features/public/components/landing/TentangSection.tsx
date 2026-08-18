import { Link } from 'react-router-dom';

const VISI =
  'Menjadi mitra perjalanan ibadah yang amanah, transparan, dan penuh keberkahan bagi setiap muslim Indonesia.';

const MISI: readonly string[] = [
  'Menyelenggarakan perjalanan haji dan umroh yang berizin resmi dan sesuai syariat.',
  'Mendampingi jamaah dengan ustadz pembimbing yang kompeten dan bersanad.',
  'Menjaga transparansi biaya dan akuntabilitas setiap layanan.',
  'Memberikan fasilitas terbaik di setiap titik perjalanan ibadah.',
  'Membangun pelayanan prima yang mengutamakan kenyamanan jamaah.',
];

export function TentangSection() {
  return (
    <section id="tentang" className="bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="relative">
            <div className="aspect-[4/3] rounded-lg bg-gradient-to-br from-primary to-primary-dark" aria-hidden="true" />
            <div className="absolute -bottom-6 -right-6 hidden h-40 w-40 rounded-lg bg-gold/20 lg:block" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-bold uppercase tracking-widest text-primary">Tentang Kami</p>
            <h2 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
              Perjalanan Ibadah yang Dijaga Sepenuhnya
            </h2>
            <p className="mt-4 text-body">
              Kami hadir untuk memudahkan setiap muslim menunaikan ibadah haji dan umroh dengan tenang. Seluruh proses,
              mulai dari pendaftaran, manasik, hingga kepulangan, didampingi oleh tim profesional yang berpengalaman.
            </p>
            <p className="mt-3 text-body">
              Dengan izin resmi Kementerian Agama serta jaringan partner global, kami memastikan setiap jamaah
              mendapatkan pelayanan terbaik di tanah suci.
            </p>

            <blockquote className="mt-6 border-l-2 border-gold pl-4">
              <p className="font-serif text-lg italic text-ink">&ldquo;{VISI}&rdquo;</p>
              <footer className="mt-2 text-sm font-bold text-primary">Tim Samira Travel</footer>
            </blockquote>

            <ol className="mt-8 space-y-3">
              {MISI.map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="font-heading text-sm font-bold text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm text-body">{item}</span>
                </li>
              ))}
            </ol>

            <Link to="/daftar" className="cta-pill mt-8 inline-block text-sm">
              Lihat Detail
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
