import { Link } from 'react-router-dom';

export function JamaahPortalPage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Portal Jamaah</h1>
      <p className="mt-2 text-sm text-ink-muted">Kelola dokumen, pembayaran, dan profil Anda.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          { to: '/portal/dokumen', title: 'Dokumen', desc: 'Upload dan pantau dokumen perjalanan.' },
          { to: '/portal/pembayaran', title: 'Pembayaran', desc: 'Lihat tagihan dan bayar via QRIS/transfer.' },
          { to: '/portal/profil', title: 'Profil', desc: 'Perbarui data diri dan preferensi.' },
        ].map((item) => (
          <Link key={item.to} to={item.to} className="rounded-2xl border border-surface-muted bg-surface p-5">
            <h2 className="font-heading text-lg font-bold text-ink">{item.title}</h2>
            <p className="mt-2 text-sm text-ink-muted">{item.desc}</p>
            <span className="cta-pill mt-6 inline-block text-sm">Buka</span>
          </Link>
        ))}
      </div>
    </section>
  );
}