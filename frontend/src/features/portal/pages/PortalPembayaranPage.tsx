import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchMe } from '../../../api/publik';
import { fetchQris, uploadBuktiPembayaran } from '../../../api/pembayaran.api';
import type { TagihanCicilan } from '../../../api/types';
import { EmptyState } from '../../../components/shared/EmptyState';
import { FileUploadZone } from '../../../components/shared/FileUploadZone';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah, formatTanggal } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

export function PortalPembayaranPage() {
  const me = useQuery({ queryKey: queryKeys.publik.me, queryFn: fetchMe });
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<TagihanCicilan | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const qris = useQuery({
    queryKey: selected ? queryKeys.pembayaran.qris(selected.id, 'DANA') : ['pembayaran', 'qris', 'none'],
    queryFn: () => fetchQris(selected?.id ?? ''),
    enabled: Boolean(selected),
  });

  const submit = useMutation({
    mutationFn: () => {
      if (!selected || !file) throw new Error('File bukti wajib dipilih');
      return uploadBuktiPembayaran({
        tagihanId: selected.id,
        jumlah: Number(selected.jumlah),
        metodeBayar: 'QRIS',
        file,
      });
    },
    onSuccess: () => {
      setSelected(null);
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.publik.me });
    },
  });

  if (me.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (me.isError || !me.data) return <p className="text-sm text-danger">Data jamaah tidak ditemukan.</p>;

  const tagihan = me.data.tagihan ?? [];
  const pembayaran = me.data.pembayaran ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-xl font-bold text-ink">Pembayaran Saya</h1>
        <p className="text-sm text-ink-muted">Cicilan perjalanan dan riwayat pembayaran Anda.</p>
      </div>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-ink">Cicilan</h2>
        {tagihan.length === 0 ? (
          <EmptyState title="Belum ada tagihan" description="Cicilan akan dibuat setelah pendaftaran Anda disetujui." />
        ) : (
          <ul className="divide-y rounded-lg bg-surface text-sm shadow-sm">
            {tagihan.map((item) => {
              const bayarAktif = item.status === 'BELUM' || item.status === 'TERLAMBAT';
              return (
                <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <p className="font-medium text-ink">Cicilan {item.urutan}</p>
                    <p className="text-xs text-ink-muted">
                      {item.deadline ? `Jatuh tempo ${formatTanggal(item.deadline)}` : 'Jatuh tempo fleksibel'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-ink">{formatRupiah(Number(item.jumlah))}</span>
                    <StatusBadge status={item.status} />
                    {bayarAktif ? (
                      <button
                        type="button"
                        className="cta-pill text-xs"
                        onClick={() => {
                          setSelected(item);
                          setFile(null);
                        }}
                      >
                        Bayar
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="font-heading text-base font-semibold text-ink">Riwayat pembayaran</h2>
        {pembayaran.length === 0 ? (
          <EmptyState title="Belum ada pembayaran" />
        ) : (
          <ul className="divide-y rounded-lg bg-surface text-sm shadow-sm">
            {pembayaran.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="font-medium text-ink">
                    {item.metodeBayar}
                    {item.tagihan ? ` · Cicilan ${item.tagihan.urutan}` : ''}
                  </p>
                  <p className="text-xs text-ink-muted">{formatTanggal(item.tanggal)}</p>
                  {item.catatanRejeksi ? (
                    <p className="mt-1 text-xs text-danger">{item.catatanRejeksi}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-ink">{formatRupiah(Number(item.jumlah))}</span>
                  <StatusBadge status={item.statusVerifikasi} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-surface p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold">Bayar cicilan {selected.urutan}</h2>
                <p className="text-sm text-ink-muted">{formatRupiah(Number(selected.jumlah))}</p>
              </div>
              <button type="button" className="text-sm text-ink-muted" onClick={() => setSelected(null)}>
                Tutup
              </button>
            </div>

            {qris.isLoading ? (
              <p className="py-8 text-center text-sm text-ink-muted">Membuat QRIS...</p>
            ) : qris.isError ? (
              <p className="py-8 text-center text-sm text-danger">Gagal membuat QRIS. Coba lagi nanti.</p>
            ) : qris.data ? (
              <>
                <div className="mx-auto mb-4 w-fit rounded-lg border border-surface-muted bg-surface p-3">
                  <img
                    src={qris.data.qrBase64}
                    alt={`QRIS ${qris.data.provider}`}
                    className="h-48 w-48"
                  />
                </div>
                <p className="mb-4 text-center text-sm text-ink-muted">
                  Scan QRIS <span className="font-semibold text-ink">{qris.data.provider}</span> di aplikasi
                  pembayaran Anda, lalu unggah bukti bayar di bawah.
                </p>
                <FileUploadZone value={file} onChange={setFile} />
                {submit.isError ? (
                  <p className="mt-2 text-xs text-danger">Gagal mengunggah bukti. Coba lagi nanti.</p>
                ) : null}
                <button
                  type="button"
                  disabled={!file || submit.isPending}
                  className="cta-pill mt-4 w-full disabled:opacity-40"
                  onClick={() => submit.mutate()}
                >
                  {submit.isPending ? 'Mengunggah...' : 'Kirim bukti pembayaran'}
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
