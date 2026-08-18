import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { fetchLanding } from '../../../../api/publik';
import { queryKeys } from '../../../../lib/queryKeys';

export function PublicPackageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.publik.landing,
    queryFn: fetchLanding,
  });
  const paket = data?.paketAktif.find((item) => item.id === id);

  if (isLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-10">Memuat paket...</p>;
  }

  if (isError || !paket) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10">
        <p className="text-danger">Paket tidak ditemukan.</p>
        <Link to="/daftar" className="cta-pill mt-6 inline-block text-sm">
          Kembali ke daftar paket
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/daftar" className="text-sm text-ink-muted hover:text-ink">
        <span aria-hidden="true">{'<'}</span> Kembali ke daftar paket
      </Link>
      <div className="mt-4 rounded-2xl border border-surface-muted bg-surface p-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="font-heading text-2xl font-bold text-ink">{paket.nama}</h1>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {paket.tipe === 'HAJI' ? 'Haji' : 'Umroh'}
          </span>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Periode: {new Date(paket.tanggalBuka).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
          {new Date(paket.tanggalTutup).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
        </p>
        <p className="mt-2 text-sm text-ink-muted">Sisa kuota: {paket.kuota}</p>
        <p className="mt-4 font-heading text-3xl font-bold text-ink">
          {Number(paket.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
        </p>
        <Link to={`/daftar/${paket.id}`} className="cta-pill mt-8 inline-block text-sm">
          Daftar Sekarang
        </Link>
      </div>
    </section>
  );
}