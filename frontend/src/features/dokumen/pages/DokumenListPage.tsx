import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { ExternalLink } from 'lucide-react';
import { useMemo, useState } from 'react';
import { fetchDokumenList, verifikasiDokumen } from '../../../api/dokumen.api';
import type { Dokumen, StatusDokumen, TipeDokumen } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatTanggalWaktu } from '../../../lib/formatters';

export function DokumenListPage() {
  const [page, setPage] = useState(1);
  const [tipe, setTipe] = useState<TipeDokumen | ''>('');
  const [selected, setSelected] = useState<Dokumen | null>(null);
  const [catatan, setCatatan] = useState('');
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: ['dokumen', 'list', { page, tipe }],
    queryFn: () => fetchDokumenList({ page, limit: 10, tipe: tipe || undefined }),
  });

  const verify = useMutation({
    mutationFn: (action: Extract<StatusDokumen, 'VERIFIED' | 'REJECTED'>) =>
      verifikasiDokumen(selected?.id ?? '', { action, catatan: catatan || undefined }),
    onSuccess: () => {
      setSelected(null);
      setCatatan('');
      void queryClient.invalidateQueries({ queryKey: ['dokumen'] });
    },
  });

  const columns = useMemo<ColumnDef<Dokumen>[]>(
    () => [
      {
        accessorKey: 'jamaah',
        header: 'Jamaah',
        cell: ({ row }) => row.original.jamaah?.namaLengkap ?? row.original.jamaahId,
      },
      { accessorKey: 'tipe', header: 'Tipe' },
      { accessorKey: 'fileName', header: 'File' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      {
        accessorKey: 'uploadedAt',
        header: 'Diunggah',
        cell: ({ getValue }) => formatTanggalWaktu(String(getValue())),
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <button type="button" className="text-primary hover:underline" onClick={() => setSelected(row.original)}>
            Preview
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Dokumen" breadcrumbs={[{ label: 'Admin' }, { label: 'Dokumen' }]} />
      <div className="mb-4 rounded-lg bg-surface p-4 shadow-sm">
        <label className="block max-w-xs text-sm">
          Tipe dokumen
          <select className="input mt-1" value={tipe} onChange={(event) => setTipe(event.target.value as TipeDokumen | '')}>
            <option value="">Semua</option>
            <option value="PASPOR">Paspor</option>
            <option value="VISA">Visa</option>
            <option value="FOTO">Foto</option>
            <option value="KTP">KTP</option>
            <option value="SERTIFIKAT">Sertifikat</option>
          </select>
        </label>
      </div>
      {list.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat dokumen.</p> : null}
      <DataTable
        columns={columns}
        data={list.data?.data ?? []}
        meta={list.data?.meta}
        isLoading={list.isLoading}
        onPageChange={setPage}
        emptyTitle="Belum ada dokumen"
      />
      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-lg bg-surface p-6 shadow-lg">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-lg font-semibold">Preview dokumen</h2>
                <p className="text-sm text-ink-muted">{selected.fileName}</p>
              </div>
              <button type="button" className="text-sm text-ink-muted" onClick={() => setSelected(null)}>
                Tutup
              </button>
            </div>
            <a href={selected.fileUrl} target="_blank" rel="noreferrer" className="mb-4 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <ExternalLink className="h-4 w-4" aria-hidden /> Buka file
            </a>
            <textarea value={catatan} onChange={(event) => setCatatan(event.target.value)} className="input min-h-24" placeholder="Catatan jika ditolak" />
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" className="rounded-md bg-danger px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={selected.status !== 'UPLOAD'} onClick={() => verify.mutate('REJECTED')}>
                Rejected
              </button>
              <button type="button" className="rounded-md bg-success px-4 py-2 text-sm font-semibold text-white disabled:opacity-40" disabled={selected.status !== 'UPLOAD'} onClick={() => verify.mutate('VERIFIED')}>
                Verified
              </button>
            </div>
            {verify.isError ? <p className="mt-2 text-xs text-danger">Gagal memverifikasi dokumen.</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
