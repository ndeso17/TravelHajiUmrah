import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { fetchKeberangkatan, fetchPendapatan } from '../../../api/laporan.api';
import { fetchPaketList } from '../../../api/paket.api';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { formatRupiah } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

export function DashboardPage() {
  const pendapatan = useQuery({
    queryKey: queryKeys.laporan.pendapatan(),
    queryFn: () => fetchPendapatan(),
  });
  const keberangkatan = useQuery({
    queryKey: queryKeys.laporan.keberangkatan(),
    queryFn: () => fetchKeberangkatan(),
  });
  const paket = useQuery({
    queryKey: queryKeys.paket.list({ isAktif: 'true', limit: 5 }),
    queryFn: () => fetchPaketList({ isAktif: 'true', limit: 5 }),
  });

  if (pendapatan.isLoading || keberangkatan.isLoading) {
    return <LoadingSkeleton variant="card" rows={4} />;
  }

  if (pendapatan.isError || keberangkatan.isError) {
    return <p className="text-sm text-danger">Gagal memuat laporan dashboard.</p>;
  }

  const totalJamaah = keberangkatan.data?.reduce((sum, row) => sum + row.jumlahJamaah, 0) ?? 0;
  const paketAktif = paket.data?.meta.total ?? 0;

  return (
    <div>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: 'Admin' }, { label: 'Dashboard' }]} />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Pendapatan diterima" value={formatRupiah(pendapatan.data?.total ?? 0)} />
        <StatCard label="Jamaah terdaftar" value={String(totalJamaah)} />
        <StatCard label="Paket aktif" value={String(paketAktif)} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg bg-surface p-4 shadow-sm">
          <h2 className="mb-4 font-heading text-sm font-semibold">Pendapatan per bulan</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...(pendapatan.data?.perBulan ?? [])]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bulan" />
                <YAxis />
                <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                <Bar dataKey="total" fill="#1B5E20" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="rounded-lg bg-surface p-4 shadow-sm">
          <h2 className="mb-4 font-heading text-sm font-semibold">Keberangkatan per kloter</h2>
          <ul className="space-y-2 text-sm">
            {(keberangkatan.data ?? []).map((row) => (
              <li key={row.kloter} className="flex justify-between border-b border-surface-muted py-2">
                <span>{row.kloter}</span>
                <span>
                  {row.jumlahJamaah} jamaah · {row.lunas} lunas
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-xl font-bold text-ink">{value}</p>
    </div>
  );
}
