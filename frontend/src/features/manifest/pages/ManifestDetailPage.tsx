import { useQuery } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { exportManifest, fetchManifest } from '../../../api/manifest.api';
import type { Jamaah } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { queryKeys } from '../../../lib/queryKeys';

export function ManifestDetailPage() {
  const { kloter = '' } = useParams();
  const decodedKloter = decodeURIComponent(kloter);
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const manifest = useQuery({
    queryKey: queryKeys.manifest.kloter(decodedKloter),
    queryFn: () => fetchManifest({ kloter: decodedKloter, page, limit: 20 }),
    enabled: decodedKloter.length > 0,
  });

  const columns = useMemo<ColumnDef<Jamaah>[]>(
    () => [
      { accessorKey: 'nomorRegistrasi', header: 'No. Registrasi' },
      {
        accessorKey: 'namaLengkap',
        header: 'Nama Lengkap',
        cell: ({ row }) => (
          <Link to={`/admin/jamaah/${row.original.id}`} className="text-primary hover:underline">
            {row.original.namaLengkap}
          </Link>
        ),
      },
      { accessorKey: 'jenisKelamin', header: 'JK' },
      { accessorKey: 'noTelp', header: 'No. Telp' },
      { accessorKey: 'statusPaspor', header: 'Paspor', cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: 'statusVisa', header: 'Visa', cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      { accessorKey: 'statusFoto', header: 'Foto', cell: ({ getValue }) => <StatusBadge status={String(getValue())} /> },
      {
        accessorKey: 'statusPendaftaran',
        header: 'Pendaftaran',
        cell: ({ getValue }) => <StatusBadge status={String(getValue())} />,
      },
    ],
    [],
  );

  async function handleExport() {
    setIsExporting(true);
    try {
      const blob = await exportManifest(decodedKloter);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `manifest-${decodedKloter}.xlsx`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={`Manifest ${decodedKloter}`}
        breadcrumbs={[{ label: 'Manifest', href: '/admin/manifest' }, { label: decodedKloter }]}
        actions={
          <button type="button" className="cta-pill flex items-center gap-2 text-sm" onClick={handleExport} disabled={isExporting}>
            <Download className="h-4 w-4" aria-hidden /> Export Excel
          </button>
        }
      />
      {manifest.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat detail manifest.</p> : null}
      <DataTable
        columns={columns}
        data={manifest.data?.data ?? []}
        meta={manifest.data?.meta}
        isLoading={manifest.isLoading}
        onPageChange={setPage}
        emptyTitle="Belum ada jamaah di manifest ini"
      />
    </div>
  );
}
