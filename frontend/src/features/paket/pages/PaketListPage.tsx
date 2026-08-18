import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deletePaket, fetchPaketList } from '../../../api/paket.api';
import type { Paket } from '../../../api/types';
import { ConfirmDialog } from '../../../components/shared/ConfirmDialog';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah, formatTanggal } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

export function PaketListPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const list = useQuery({
    queryKey: queryKeys.paket.list({ page, q }),
    queryFn: () => fetchPaketList({ page, limit: 10, q: q || undefined }),
  });

  const remove = useMutation({
    mutationFn: deletePaket,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.paket.all });
      setDeleteId(null);
    },
  });

  const columns = useMemo<ColumnDef<Paket>[]>(
    () => [
      { accessorKey: 'nama', header: 'Nama' },
      { accessorKey: 'tipe', header: 'Tipe' },
      {
        accessorKey: 'harga',
        header: 'Harga',
        cell: ({ getValue }) => formatRupiah(Number(getValue())),
      },
      { accessorKey: 'kuota', header: 'Kuota' },
      {
        accessorKey: 'tanggalBuka',
        header: 'Buka',
        cell: ({ getValue }) => formatTanggal(String(getValue())),
      },
      {
        accessorKey: 'isAktif',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue() ? 'aktif' : 'expired'} />,
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Link to={`/admin/paket/${row.original.id}/edit`} className="text-primary hover:underline">
              Edit
            </Link>
            <button type="button" className="cursor-pointer text-danger" onClick={() => setDeleteId(row.original.id)}>
              Hapus
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Paket"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Paket' }]}
        actions={
          <Link to="/admin/paket/baru" className="cta-pill text-sm">
            Paket baru
          </Link>
        }
      />
      <input
        value={q}
        onChange={(event) => {
          setQ(event.target.value);
          setPage(1);
        }}
        placeholder="Cari nama paket"
        className="mb-4 w-full max-w-sm rounded-md border border-surface-muted px-3 py-2 text-sm"
      />
      {list.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat paket.</p> : null}
      <DataTable
        columns={columns}
        data={list.data?.data ?? []}
        meta={list.data?.meta}
        isLoading={list.isLoading}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Hapus paket?"
        description="Paket yang sudah punya jamaah tidak bisa dihapus."
        danger
        confirmLabel="Hapus"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) remove.mutate(deleteId);
        }}
      />
    </div>
  );
}
