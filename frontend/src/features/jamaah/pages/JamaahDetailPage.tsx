import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchJamaah } from '../../../api/jamaah.api';
import { generateTagihan } from '../../../api/tagihan.api';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah, formatTanggal } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

type Tab = 'tagihan' | 'pembayaran' | 'dokumen';

export function JamaahDetailPage() {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('tagihan');
  const queryClient = useQueryClient();

  const detail = useQuery({
    queryKey: queryKeys.jamaah.detail(id ?? ''),
    queryFn: () => fetchJamaah(id ?? ''),
    enabled: Boolean(id),
  });

  const generate = useMutation({
    mutationFn: () =>
      generateTagihan({
        jamaahId: id ?? '',
        totalHarga: Number(detail.data?.paket?.harga ?? 0),
        jumlahCicilan: 4,
      }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: queryKeys.jamaah.detail(id ?? '') }),
  });

  if (detail.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (detail.isError || !detail.data) return <p className="text-sm text-danger">Jamaah tidak ditemukan.</p>;

  const jamaah = detail.data;

  return (
    <div>
      <PageHeader
        title={jamaah.namaLengkap}
        breadcrumbs={[{ label: 'Jamaah', href: '/admin/jamaah' }, { label: jamaah.nomorRegistrasi }]}
        actions={
          <Link to={`/admin/jamaah/${jamaah.id}`} className="text-sm text-primary">
            {jamaah.nomorRegistrasi}
          </Link>
        }
      />
      <section className="mb-6 grid gap-3 rounded-lg bg-surface p-5 text-sm md:grid-cols-3">
        <Info label="No. registrasi" value={jamaah.nomorRegistrasi} />
        <Info label="Paket" value={jamaah.paket?.nama ?? '-'} />
        <Info label="Kloter" value={jamaah.kloter ?? '-'} />
        <Info label="Telepon" value={jamaah.noTelp} />
        <div>
          <p className="text-ink-muted">Status</p>
          <StatusBadge status={jamaah.statusPendaftaran} />
        </div>
        <div className="flex gap-2">
          <StatusBadge status={jamaah.statusPaspor} />
          <StatusBadge status={jamaah.statusVisa} />
          <StatusBadge status={jamaah.statusFoto} />
        </div>
      </section>
      <div className="mb-4 flex gap-2">
        {(['tagihan', 'pembayaran', 'dokumen'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-sm ${tab === item ? 'bg-primary text-white' : 'bg-surface'}`}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === 'tagihan' ? (
        <div className="rounded-lg bg-surface p-4">
          <div className="mb-3 flex justify-end">
            <button type="button" className="cta-pill text-sm" onClick={() => generate.mutate()}>
              Generate 4 cicilan
            </button>
          </div>
          <ul className="divide-y text-sm">
            {(jamaah.tagihan ?? []).map((item) => (
              <li key={item.id} className="flex justify-between py-2">
                <span>
                  Cicilan {item.urutan} · {item.deadline ? formatTanggal(item.deadline) : 'fleksibel'}
                </span>
                <span className="font-mono">
                  {formatRupiah(Number(item.jumlah))} <StatusBadge status={item.status} />
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {tab === 'pembayaran' ? (
        <ul className="rounded-lg bg-surface p-4 text-sm">
          {(jamaah.pembayaran ?? []).map((item) => (
            <li key={item.id} className="flex justify-between border-b py-2">
              <span>
                {item.metodeBayar} · {formatTanggal(item.tanggal)}
              </span>
              <span>
                {formatRupiah(Number(item.jumlah))} <StatusBadge status={item.statusVerifikasi} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === 'dokumen' ? (
        <ul className="rounded-lg bg-surface p-4 text-sm">
          {(jamaah.dokumen ?? []).map((item) => (
            <li key={item.id} className="flex justify-between border-b py-2">
              <span>
                {item.tipe} · {item.fileName}
              </span>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      ) : null}
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
