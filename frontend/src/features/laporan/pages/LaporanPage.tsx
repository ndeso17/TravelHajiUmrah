import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useState } from 'react';
import { fetchKeberangkatan, fetchPendapatan } from '../../../api/laporan.api';
import { DateRangePicker } from '../../../components/shared/DateRangePicker';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { formatRupiah } from '../../../lib/formatters';
import { queryKeys, type DateRange } from '../../../lib/queryKeys';

type Tab = 'pendapatan' | 'keberangkatan';

const COLORS = ['#1B5E20', '#C9A84C', '#D97706', '#16A34A'];

export function LaporanPage() {
  const [range, setRange] = useState<DateRange>({});
  const [tab, setTab] = useState<Tab>('pendapatan');

  const pendapatan = useQuery({
    queryKey: queryKeys.laporan.pendapatan(range),
    queryFn: () => fetchPendapatan(range.from, range.to),
  });
  const keberangkatan = useQuery({
    queryKey: queryKeys.laporan.keberangkatan(range),
    queryFn: () => fetchKeberangkatan(range.from, range.to),
  });

  const perMetode = Object.entries(pendapatan.data?.perMetode ?? {}).map(([name, value]) => ({ name, value }));

  function exportCsv() {
    const rows = tab === 'pendapatan'
      ? [['Paket', 'Total'], ...(pendapatan.data?.perPaket ?? []).map((row) => [row.nama, String(row.total)])]
      : [['Kloter', 'Jamaah', 'Dokumen Lengkap', 'Lunas'], ...(keberangkatan.data ?? []).map((row) => [row.kloter, String(row.jumlahJamaah), String(row.dokumenLengkap), String(row.lunas)])];
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `laporan-${tab}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <PageHeader
        title="Laporan"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Laporan' }]}
        actions={<button type="button" className="cta-pill text-sm" onClick={exportCsv}>Export CSV</button>}
      />
      <section className="mb-6 rounded-lg bg-surface p-4 shadow-sm">
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </section>
      <div className="mb-4 flex gap-2">
        {(['pendapatan', 'keberangkatan'] as const).map((item) => (
          <button
            key={item}
            type="button"
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm ${tab === item ? 'bg-primary text-white' : 'bg-surface'}`}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === 'pendapatan' ? (
        pendapatan.isLoading ? <LoadingSkeleton variant="card" rows={4} /> : (
          <div className="grid gap-6 lg:grid-cols-2">
            <StatCard label="Total pendapatan" value={formatRupiah(pendapatan.data?.total ?? 0)} />
            <section className="rounded-lg bg-surface p-4 shadow-sm lg:col-span-2">
              <h2 className="mb-4 font-heading font-semibold">Pendapatan per bulan</h2>
              <div className="h-72">
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
              <h2 className="mb-4 font-heading font-semibold">Per metode</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={perMetode} dataKey="value" nameKey="name" outerRadius={90} label>
                      {perMetode.map((entry, index) => <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(value) => formatRupiah(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>
            <section className="rounded-lg bg-surface p-4 text-sm shadow-sm">
              <h2 className="mb-4 font-heading font-semibold">Per paket</h2>
              <ul className="divide-y">
                {(pendapatan.data?.perPaket ?? []).map((row) => (
                  <li key={row.paketId} className="flex justify-between py-2">
                    <span>{row.nama}</span>
                    <span className="font-mono">{formatRupiah(row.total)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )
      ) : (
        keberangkatan.isLoading ? <LoadingSkeleton variant="card" rows={4} /> : (
          <section className="rounded-lg bg-surface p-4 shadow-sm">
            <h2 className="mb-4 font-heading font-semibold">Keberangkatan per kloter</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[...(keberangkatan.data ?? [])]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kloter" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="jumlahJamaah" fill="#1B5E20" name="Jamaah" />
                  <Bar dataKey="dokumenLengkap" fill="#C9A84C" name="Dokumen lengkap" />
                  <Bar dataKey="lunas" fill="#16A34A" name="Lunas" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )
      )}
      {pendapatan.isError || keberangkatan.isError ? <p className="mt-4 text-sm text-danger">Gagal memuat laporan.</p> : null}
    </div>
  );
}

function StatCard({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-lg bg-surface p-4 shadow-sm">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
