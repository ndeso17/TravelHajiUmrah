import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchManifest } from '../../../api/manifest.api';
import type { Jamaah } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { queryKeys } from '../../../lib/queryKeys';

const DEFAULT_KLOTER = 'JKG-01';

export function ManifestListPage() {
  const [kloter, setKloter] = useState(DEFAULT_KLOTER);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  const manifest = useQuery({
    queryKey: queryKeys.manifest.kloter(kloter),
    queryFn: () => fetchManifest({ kloter, page, limit: 10 }),
  });

  const columns = useMemo<ColumnDef<Jamaah>[]>(
    () => [
      {
        accessorKey: 'namaLengkap',
        header: 'Nama Jamaah',
        cell: ({ row }) => (
          <Link to={`/admin/jamaah/${row.original.id}`} className="text-primary hover:underline">
            {row.original.namaLengkap}
          </Link>
        ),
      },
      { accessorKey: 'nomorRegistrasi', header: 'No. Registrasi' },
      { accessorKey: 'jenisKelamin', header: 'JK' },
      { accessorKey: 'noTelp', header: 'No. Telp' },
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
        title="Manifest"
        breadcrumbs={[{ label: 'Admin' }, { label: 'Manifest' }]}
        actions={
          <button type="button" className="cta-pill text-sm" onClick={() => navigate(`/admin/manifest/${encodeURIComponent(kloter)}`)}>
            Lihat detail
          </button>
        }
      />
      <div className="mb-4 rounded-lg bg-surface p-4 shadow-sm">
        <label className="block max-w-sm text-sm">
          Kloter
          <input
            value={kloter}
            onChange={(event) => {
              setKloter(event.target.value);
              setPage(1);
            }}
            className="input mt-1"
            placeholder="Contoh: JKG-01"
          />
        </label>
      </div>
      {manifest.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat manifest. Pastikan kloter terisi.</p> : null}
      <DataTable
        columns={columns}
        data={manifest.data?.data ?? []}
        meta={manifest.data?.meta}
        isLoading={manifest.isLoading}
        onPageChange={setPage}
        emptyTitle="Manifest kloter ini kosong"
      />
    </div>
  );
}
