import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { cashPembayaran, fetchInvoice, verifikasiPembayaran } from '../../../api/pembayaran.api';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah, formatTanggalWaktu } from '../../../lib/formatters';

export function PembayaranDetailPage() {
  const { id = '' } = useParams();
  const [catatan, setCatatan] = useState('');
  const [cashJumlah, setCashJumlah] = useState('');
  const queryClient = useQueryClient();

  const invoice = useQuery({
    queryKey: ['pembayaran', 'invoice', id],
    queryFn: () => fetchInvoice(id),
    enabled: id.length > 0,
  });

  const verify = useMutation({
    mutationFn: (action: 'terima' | 'tolak') => verifikasiPembayaran(id, { action, catatan: catatan || null }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pembayaran'] }),
  });

  const cash = useMutation({
    mutationFn: () =>
      cashPembayaran({
        tagihanId: invoice.data?.pembayaran.tagihanId ?? '',
        jumlah: Number(cashJumlah),
        tanggal: new Date().toISOString(),
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['pembayaran'] }),
  });

  if (invoice.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (invoice.isError || !invoice.data) return <p className="text-sm text-danger">Pembayaran tidak ditemukan.</p>;

  const pembayaran = invoice.data.pembayaran;
  const canVerify = pembayaran.statusVerifikasi === 'MENUNGGU';
  const canCash = pembayaran.tagihanId && pembayaran.statusVerifikasi !== 'DITERIMA';

  return (
    <div>
      <PageHeader title="Detail Pembayaran" breadcrumbs={[{ label: 'Pembayaran', href: '/admin/pembayaran' }, { label: invoice.data.nomorInvoice }]} />
      <section className="mb-6 rounded-lg bg-surface p-5 shadow-sm">
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <Info label="Invoice" value={invoice.data.nomorInvoice} />
          <Info label="Jamaah" value={pembayaran.jamaah.namaLengkap} />
          <Info label="Registrasi" value={pembayaran.jamaah.nomorRegistrasi} />
          <Info label="Paket" value={pembayaran.jamaah.paket.nama} />
          <Info label="Metode" value={pembayaran.metodeBayar} />
          <Info label="Tanggal" value={formatTanggalWaktu(pembayaran.tanggal)} />
          <Info label="Jumlah" value={formatRupiah(Number(pembayaran.jumlah))} />
          <div>
            <p className="text-ink-muted">Status</p>
            <StatusBadge status={pembayaran.statusVerifikasi} />
          </div>
          <Info label="Tagihan" value={pembayaran.tagihan ? `Cicilan ${pembayaran.tagihan.urutan}` : '-'} />
        </div>
      </section>
      {pembayaran.buktiBayar ? (
        <section className="mb-6 rounded-lg bg-surface p-5 text-sm shadow-sm">
          <p className="mb-2 font-semibold">Bukti bayar</p>
          <a href={pembayaran.buktiBayar} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            Buka bukti bayar
          </a>
        </section>
      ) : null}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading font-semibold">Verifikasi</h2>
          <textarea value={catatan} onChange={(event) => setCatatan(event.target.value)} className="input min-h-24" placeholder="Catatan saat menolak" />
          <div className="mt-3 flex gap-2">
            <button type="button" className="rounded-md bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={!canVerify} onClick={() => verify.mutate('terima')}>
              Terima
            </button>
            <button type="button" className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={!canVerify} onClick={() => verify.mutate('tolak')}>
              Tolak
            </button>
          </div>
          {verify.isError ? <p className="mt-2 text-xs text-danger">Gagal memverifikasi pembayaran.</p> : null}
        </div>
        <div className="rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="mb-3 font-heading font-semibold">Input Cash</h2>
          <input value={cashJumlah} onChange={(event) => setCashJumlah(event.target.value)} className="input font-mono" placeholder="Jumlah cash" type="number" />
          <button type="button" className="cta-pill mt-3 text-sm disabled:opacity-40" disabled={!canCash || Number(cashJumlah) <= 0} onClick={() => cash.mutate()}>
            Simpan Cash
          </button>
          {cash.isError ? <p className="mt-2 text-xs text-danger">Gagal menyimpan pembayaran cash.</p> : null}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div>
      <p className="text-ink-muted">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
