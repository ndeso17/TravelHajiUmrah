import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { fetchMe } from '../../../api/publik';
import { uploadDokumen } from '../../../api/dokumen.api';
import { EmptyState } from '../../../components/shared/EmptyState';
import { FileUploadZone } from '../../../components/shared/FileUploadZone';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatTanggalWaktu } from '../../../lib/formatters';
import { queryKeys } from '../../../lib/queryKeys';

const TIPE_OPTIONS = ['PASPOR', 'VISA', 'FOTO', 'KTP', 'SERTIFIKAT'] as const;

export function PortalDokumenPage() {
  const me = useQuery({ queryKey: queryKeys.publik.me, queryFn: fetchMe });
  const queryClient = useQueryClient();
  const [tipe, setTipe] = useState<(typeof TIPE_OPTIONS)[number]>('PASPOR');
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('File wajib dipilih');
      return uploadDokumen({ tipe, file });
    },
    onSuccess: () => {
      setFile(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.publik.me });
    },
  });

  if (me.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (me.isError || !me.data) return <p className="text-sm text-danger">Data jamaah tidak ditemukan.</p>;

  const dokumen = me.data.dokumen ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-xl font-bold text-ink">Dokumen Saya</h1>
        <p className="text-sm text-ink-muted">Unggah dokumen perjalanan Anda untuk diverifikasi tim kami.</p>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          upload.mutate();
        }}
        className="space-y-4 rounded-lg bg-surface p-5"
      >
        <label className="block text-sm">
          <span className="mb-1 block text-ink">Tipe dokumen</span>
          <select
            className="input"
            value={tipe}
            onChange={(event) => setTipe(event.target.value as (typeof TIPE_OPTIONS)[number])}
          >
            {TIPE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {item.charAt(0) + item.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </label>
        <FileUploadZone value={file} onChange={setFile} />
        {upload.isError ? <p className="text-xs text-danger">Gagal mengunggah dokumen. Coba lagi nanti.</p> : null}
        <button type="submit" disabled={!file || upload.isPending} className="cta-pill text-sm disabled:opacity-40">
          {upload.isPending ? 'Mengunggah...' : 'Unggah dokumen'}
        </button>
      </form>

      {dokumen.length === 0 ? (
        <EmptyState title="Belum ada dokumen" description="Unggah dokumen pertama Anda melalui form di atas." />
      ) : (
        <ul className="divide-y rounded-lg bg-surface text-sm shadow-sm">
          {dokumen.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{item.fileName}</p>
                <p className="text-xs text-ink-muted">
                  {item.tipe} · {formatTanggalWaktu(item.uploadedAt)}
                </p>
                {item.catatan ? <p className="mt-1 text-xs text-danger">{item.catatan}</p> : null}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={item.status} />
                <a
                  href={item.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  Buka
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
