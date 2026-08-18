import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchJamaahList } from '../../../api/jamaah.api';
import type { Jamaah } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { queryKeys } from '../../../lib/queryKeys';

export function JamaahListPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const list = useQuery({
    queryKey: queryKeys.jamaah.list({ page, q }),
    queryFn: () => fetchJamaahList({ page, limit: 10, q: q || undefined }),
  });

  const columns = useMemo<ColumnDef<Jamaah>[]>(
    () => [
      {
        accessorKey: 'namaLengkap',
        header: 'Nama',
        cell: ({ row }) => (
          <Link to={`/admin/jamaah/${row.original.id}`} className="text-primary hover:underline">
            {row.original.namaLengkap}
          </Link>
        ),
      },
      { accessorKey: 'nomorRegistrasi', header: 'No. Registrasi' },
      {
        accessorKey: 'paket',
        header: 'Paket',
        cell: ({ row }) => row.original.paket?.nama ?? '-',
      },
      { accessorKey: 'kloter', header: 'Kloter' },
      {
        accessorKey: 'statusPendaftaran',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
    ],
    [],
  );

  return (
    <div>
      <PageHeader
        title="Jamaah"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Jamaah' }]}
        actions={
          <Link to="/admin/jamaah/baru" className="cta-pill text-sm">
            Jamaah baru
          </Link>
        }
      />
      <input
        value={q}
        onChange={(event) => {
          setQ(event.target.value);
          setPage(1);
        }}
        placeholder="Cari nama / nomor registrasi"
        className="input mb-4 max-w-sm"
      />
      {list.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat jamaah.</p> : null}
      <DataTable
        columns={columns}
        data={list.data?.data ?? []}
        meta={list.data?.meta}
        isLoading={list.isLoading}
        onPageChange={setPage}
      />
    </div>
  );
}
