import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchMe } from '../../../api/publik';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

export function PortalDashboardPage() {
  const me = useQuery({ queryKey: queryKeys.publik.me, queryFn: fetchMe });

  if (me.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (me.isError || !me.data) return <p className="text-sm text-danger">Data jamaah tidak ditemukan.</p>;

  const jamaah = me.data;
  const totalTagihan = (jamaah.tagihan ?? []).reduce((sum, item) => sum + Number(item.jumlah), 0);
  const totalDibayar = (jamaah.pembayaran ?? [])
    .filter((item) => item.statusVerifikasi === 'DITERIMA')
    .reduce((sum, item) => sum + Number(item.jumlah), 0);
  const sisa = Math.max(0, totalTagihan - totalDibayar);
  const jumlahDokumen = (jamaah.dokumen ?? []).length;

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-surface p-5 shadow-sm">
        <p className="text-sm text-ink-muted">Selamat datang kembali,</p>
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink">{jamaah.namaLengkap}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs text-ink-muted">
            {jamaah.nomorRegistrasi}
          </span>
          <StatusBadge status={jamaah.statusPendaftaran} />
          <span className="text-ink-muted">{jamaah.paket?.nama ?? '-'}</span>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Total tagihan</p>
          <p className="mt-1 font-mono text-lg font-semibold text-ink">{formatRupiah(totalTagihan)}</p>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Sudah dibayar</p>
          <p className="mt-1 font-mono text-lg font-semibold text-success">{formatRupiah(totalDibayar)}</p>
        </div>
        <div className="rounded-lg bg-surface p-4 shadow-sm">
          <p className="text-xs text-ink-muted">Sisa tagihan</p>
          <p className="mt-1 font-mono text-lg font-semibold text-danger">{formatRupiah(sisa)}</p>
        </div>
      </section>

      <section className="rounded-lg bg-surface p-5 shadow-sm">
        <h2 className="font-heading text-base font-semibold text-ink">Status dokumen</h2>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-ink-muted">Paspor</p>
            <StatusBadge status={jamaah.statusPaspor} />
          </div>
          <div>
            <p className="text-ink-muted">Visa</p>
            <StatusBadge status={jamaah.statusVisa} />
          </div>
          <div>
            <p className="text-ink-muted">Foto</p>
            <StatusBadge status={jamaah.statusFoto} />
          </div>
          <div>
            <p className="text-ink-muted">Dokumen diunggah</p>
            <span className="text-sm font-semibold">{jumlahDokumen} file</span>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link to="/jamaah/pembayaran" className="cta-pill text-sm">
          Lihat pembayaran
        </Link>
        <Link to="/jamaah/dokumen" className="rounded-lg border border-surface-muted px-4 py-2 text-sm text-ink hover:text-primary">
          Kelola dokumen
        </Link>
        <Link to="/jamaah/profil" className="rounded-lg border border-surface-muted px-4 py-2 text-sm text-ink hover:text-primary">
          Edit profil
        </Link>
      </section>
    </div>
  );
}
