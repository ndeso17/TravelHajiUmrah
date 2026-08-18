import { useQuery } from '@tanstack/react-query';
import { fetchLanding } from '../../../../api/publik';
import { Link, useSearchParams } from 'react-router-dom';
import { queryKeys } from '../../../../lib/queryKeys';

type Tipe = 'ALL' | 'HAJI' | 'UMROH';

export function PublicPackagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tipeParam = searchParams.get('tipe');
  const tipe: Tipe = tipeParam === 'HAJI' || tipeParam === 'UMROH' ? tipeParam : 'ALL';

  const { data, isLoading, isError } = useQuery({
    queryKey: queryKeys.publik.landing,
    queryFn: fetchLanding,
  });

  const paket = (data?.paketAktif ?? [])
    .filter((item) => item.isAktif)
    .filter((item) => (tipe === 'ALL' ? true : item.tipe === tipe));

  const selectTipe = (next: Tipe) => {
    setSearchParams(next === 'ALL' ? {} : { tipe: next }, { replace: true });
  };

  if (isLoading) {
    return <p className="mx-auto max-w-7xl px-4 py-10">Memuat paket...</p>;
  }

  if (isError) {
    return <p className="mx-auto max-w-7xl px-4 py-10 text-danger">Gagal memuat paket.</p>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Paket Haji & Umroh</h1>
          <p className="text-sm text-ink-muted">Pilih paket yang sesuai kebutuhan ibadah Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          {(['ALL', 'HAJI', 'UMROH'] as Tipe[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => selectTipe(item)}
              className={[
                'rounded-full border px-4 py-2 text-sm font-semibold transition-colors duration-200',
                tipe === item ? 'bg-primary text-white' : 'text-ink hover:bg-surface-muted',
              ].join(' ')}
            >
              {item === 'ALL' ? 'Semua' : item === 'HAJI' ? 'Haji' : 'Umroh'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paket.map((item) => (
          <div key={item.id} className="rounded-2xl border border-surface-muted bg-surface p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-lg font-bold text-ink">{item.nama}</h2>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {item.tipe === 'HAJI' ? 'Haji' : 'Umroh'}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink-muted">
              {new Date(item.tanggalBuka).toLocaleDateString('id-ID', { dateStyle: 'medium' })} -{' '}
              {new Date(item.tanggalTutup).toLocaleDateString('id-ID', { dateStyle: 'medium' })}
            </p>
            <p className="mt-3 font-heading text-xl font-bold text-ink">
              {Number(item.harga).toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })}
            </p>
            <p className="mt-1 text-xs text-ink-muted">Sisa kuota: {item.kuota}</p>
            <Link
              to={`/paket/${item.id}`}
              className="cta-pill mt-6 inline-block w-full text-center text-sm"
            >
              Lihat Detail
            </Link>
          </div>
        ))}
      </div>

      {paket.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink-muted">Belum ada paket yang tersedia.</p>
      ) : null}
    </section>
  );
}
