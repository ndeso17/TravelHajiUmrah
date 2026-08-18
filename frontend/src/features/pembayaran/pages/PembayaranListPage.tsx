import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchPembayaranList } from '../../../api/pembayaran.api';
import type { MetodeBayar, Pembayaran, StatusVerifikasi } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatRupiah, formatTanggalWaktu } from '../../../lib/formatters';

export function PembayaranListPage() {
  const [page, setPage] = useState(1);
  const [statusVerifikasi, setStatusVerifikasi] = useState<StatusVerifikasi | ''>('');
  const [metodeBayar, setMetodeBayar] = useState<MetodeBayar | ''>('');

  const list = useQuery({
    queryKey: ['pembayaran', 'list', { page, statusVerifikasi, metodeBayar }],
    queryFn: () =>
      fetchPembayaranList({
        page,
        limit: 10,
        statusVerifikasi: statusVerifikasi || undefined,
        metodeBayar: metodeBayar || undefined,
      }),
  });

  const columns = useMemo<ColumnDef<Pembayaran>[]>(
    () => [
      {
        accessorKey: 'jamaah',
        header: 'Jamaah',
        cell: ({ row }) => row.original.jamaah?.namaLengkap ?? row.original.jamaahId,
      },
      { accessorKey: 'metodeBayar', header: 'Metode' },
      {
        accessorKey: 'jumlah',
        header: 'Jumlah',
        cell: ({ getValue }) => formatRupiah(Number(getValue())),
      },
      {
        accessorKey: 'statusVerifikasi',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
      {
        accessorKey: 'tanggal',
        header: 'Tanggal',
        cell: ({ getValue }) => formatTanggalWaktu(String(getValue())),
      },
      {
        id: 'aksi',
        header: 'Aksi',
        cell: ({ row }) => (
          <Link to={`/admin/pembayaran/${row.original.id}`} className="text-primary hover:underline">
            Detail
          </Link>
        ),
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Pembayaran" breadcrumbs={[{ label: 'Admin' }, { label: 'Pembayaran' }]} />
      <div className="mb-4 flex flex-wrap gap-3 rounded-lg bg-surface p-4 text-sm shadow-sm">
        <label>
          Status
          <select className="input mt-1" value={statusVerifikasi} onChange={(event) => setStatusVerifikasi(event.target.value as StatusVerifikasi | '')}>
            <option value="">Semua</option>
            <option value="MENUNGGU">Menunggu</option>
            <option value="DITERIMA">Diterima</option>
            <option value="DITOLAK">Ditolak</option>
          </select>
        </label>
        <label>
          Metode
          <select className="input mt-1" value={metodeBayar} onChange={(event) => setMetodeBayar(event.target.value as MetodeBayar | '')}>
            <option value="">Semua</option>
            <option value="QRIS">QRIS</option>
            <option value="TRANSFER">Transfer</option>
            <option value="CASH">Cash</option>
          </select>
        </label>
      </div>
      {list.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat pembayaran.</p> : null}
      <DataTable
        columns={columns}
        data={list.data?.data ?? []}
        meta={list.data?.meta}
        isLoading={list.isLoading}
        onPageChange={setPage}
        emptyTitle="Belum ada pembayaran"
      />
    </div>
  );
}
