import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { createPaket, fetchPaket, updatePaket } from '../../../api/paket.api';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { queryKeys } from '../../../lib/queryKeys';

const schema = z.object({
  nama: z.string().min(1, 'Nama wajib'),
  tipe: z.enum(['HAJI', 'UMROH']),
  harga: z.coerce.number().positive('Harga harus positif'),
  kuota: z.coerce.number().int().positive('Kuota harus positif'),
  tanggalBuka: z.string().min(1),
  tanggalTutup: z.string().min(1),
  itinerary: z.string().optional(),
  fasilitasText: z.string().optional(),
  isAktif: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function toDateInput(iso: string): string {
  return iso.slice(0, 10);
}

export function PaketFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const detail = useQuery({
    queryKey: id ? queryKeys.paket.detail(id) : ['paket', 'detail', 'new'],
    queryFn: () => fetchPaket(id ?? ''),
    enabled: Boolean(id),
  });

  const defaults = useMemo<FormValues>(
    () => ({
      nama: detail.data?.nama ?? '',
      tipe: detail.data?.tipe ?? 'UMROH',
      harga: detail.data ? Number(detail.data.harga) : 0,
      kuota: detail.data?.kuota ?? 1,
      tanggalBuka: detail.data ? toDateInput(detail.data.tanggalBuka) : '',
      tanggalTutup: detail.data ? toDateInput(detail.data.tanggalTutup) : '',
      itinerary: detail.data?.itinerary ?? '',
      fasilitasText: detail.data?.fasilitas.join(', ') ?? '',
      isAktif: detail.data?.isAktif ?? true,
    }),
    [detail.data],
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: defaults });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        nama: values.nama,
        tipe: values.tipe,
        harga: values.harga,
        kuota: values.kuota,
        tanggalBuka: values.tanggalBuka,
        tanggalTutup: values.tanggalTutup,
        itinerary: values.itinerary || null,
        fasilitas: values.fasilitasText
          ? values.fasilitasText.split(',').map((item) => item.trim()).filter(Boolean)
          : [],
        isAktif: values.isAktif,
      };
      return id ? updatePaket(id, payload) : createPaket(payload);
    },
    onSuccess: () => navigate('/admin/paket'),
  });

  if (isEdit && detail.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (isEdit && detail.isError) return <p className="text-sm text-danger">Paket tidak ditemukan.</p>;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit paket' : 'Paket baru'} breadcrumbs={[{ label: 'Paket', href: '/admin/paket' }]} />
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="max-w-xl space-y-4 rounded-lg bg-surface p-6">
        <Field label="Nama" error={errors.nama?.message}>
          <input className="input" {...register('nama')} />
        </Field>
        <Field label="Tipe" error={errors.tipe?.message}>
          <select className="input" {...register('tipe')}>
            <option value="UMROH">Umroh</option>
            <option value="HAJI">Haji</option>
          </select>
        </Field>
        <Field label="Harga" error={errors.harga?.message}>
          <input type="number" className="input font-mono" {...register('harga')} />
        </Field>
        <Field label="Kuota" error={errors.kuota?.message}>
          <input type="number" className="input" {...register('kuota')} />
        </Field>
        <Field label="Tanggal buka" error={errors.tanggalBuka?.message}>
          <input type="date" className="input" {...register('tanggalBuka')} />
        </Field>
        <Field label="Tanggal tutup" error={errors.tanggalTutup?.message}>
          <input type="date" className="input" {...register('tanggalTutup')} />
        </Field>
        <Field label="Fasilitas (pisahkan koma)">
          <input className="input" {...register('fasilitasText')} />
        </Field>
        <Field label="Itinerary">
          <textarea className="input min-h-24" {...register('itinerary')} />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" {...register('isAktif')} /> Aktif
        </label>
        {save.isError ? <p className="text-xs text-danger">Gagal menyimpan paket.</p> : null}
        <button type="submit" disabled={isSubmitting || save.isPending} className="cta-pill">
          Simpan
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  readonly label: string;
  readonly error?: string;
  readonly children: ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : null}
    </label>
  );
}
