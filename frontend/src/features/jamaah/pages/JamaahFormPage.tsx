import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { createJamaah, fetchJamaah, updateJamaah } from '../../../api/jamaah.api';
import { fetchPaketList } from '../../../api/paket.api';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { PageHeader } from '../../../components/shared/PageHeader';
import { queryKeys } from '../../../lib/queryKeys';

const schema = z
  .object({
    paketId: z.string().min(1, 'Paket wajib'),
    kloter: z.string().optional(),
    namaLengkap: z.string().min(1),
    namaAyah: z.string().optional(),
    tempatLahir: z.string().min(1),
    tanggalLahir: z.string().min(1),
    jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
    statusPerkawinan: z.string().optional(),
    alamat: z.string().min(1),
    noTelp: z.string().min(8),
    email: z.string().email().optional().or(z.literal('')),
    tipeSkema: z.enum(['NORMAL', 'UMROH_DULU_BAYAR_NANTI']),
    depositMinimal: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tipeSkema === 'UMROH_DULU_BAYAR_NANTI' && !data.depositMinimal) {
      ctx.addIssue({ code: 'custom', path: ['depositMinimal'], message: 'Deposit wajib untuk UDBN' });
    }
  });

type FormValues = z.infer<typeof schema>;

export function JamaahFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const pakets = useQuery({
    queryKey: queryKeys.paket.list({ limit: 100 }),
    queryFn: () => fetchPaketList({ limit: 100 }),
  });
  const detail = useQuery({
    queryKey: id ? queryKeys.jamaah.detail(id) : ['jamaah', 'new'],
    queryFn: () => fetchJamaah(id ?? ''),
    enabled: Boolean(id),
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      paketId: detail.data?.paketId ?? '',
      kloter: detail.data?.kloter ?? '',
      namaLengkap: detail.data?.namaLengkap ?? '',
      namaAyah: detail.data?.namaAyah ?? '',
      tempatLahir: detail.data?.tempatLahir ?? '',
      tanggalLahir: detail.data?.tanggalLahir.slice(0, 10) ?? '',
      jenisKelamin: detail.data?.jenisKelamin ?? 'LAKI_LAKI',
      statusPerkawinan: detail.data?.statusPerkawinan ?? '',
      alamat: detail.data?.alamat ?? '',
      noTelp: detail.data?.noTelp ?? '',
      email: detail.data?.email ?? '',
      tipeSkema: detail.data?.tipeSkema ?? 'NORMAL',
      depositMinimal: detail.data?.depositMinimal ? Number(detail.data.depositMinimal) : undefined,
    },
  });

  const tipeSkema = useWatch({ control, name: 'tipeSkema' });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      const payload = {
        ...values,
        email: values.email || null,
        depositMinimal: values.tipeSkema === 'UMROH_DULU_BAYAR_NANTI' ? values.depositMinimal : null,
      };
      return id ? updateJamaah(id, payload) : createJamaah(payload);
    },
    onSuccess: (jamaah) => navigate(`/admin/jamaah/${jamaah.id}`),
  });

  if (isEdit && detail.isLoading) return <LoadingSkeleton variant="form" rows={8} />;

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit jamaah' : 'Jamaah baru'} breadcrumbs={[{ label: 'Jamaah', href: '/admin/jamaah' }]} />
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="grid max-w-3xl gap-4 rounded-lg bg-surface p-6 md:grid-cols-2">
        <label className="text-sm md:col-span-2">
          Nama lengkap
          <input className="input mt-1" {...register('namaLengkap')} />
          {errors.namaLengkap ? <span className="text-xs text-danger">{errors.namaLengkap.message}</span> : null}
        </label>
        <label className="text-sm">
          Nama ayah
          <input className="input mt-1" {...register('namaAyah')} />
        </label>
        <label className="text-sm">
          Paket
          <select className="input mt-1" {...register('paketId')}>
            <option value="">Pilih paket</option>
            {(pakets.data?.data ?? []).map((paket) => (
              <option key={paket.id} value={paket.id}>
                {paket.nama}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Tempat lahir
          <input className="input mt-1" {...register('tempatLahir')} />
        </label>
        <label className="text-sm">
          Tanggal lahir
          <input type="date" className="input mt-1" {...register('tanggalLahir')} />
        </label>
        <label className="text-sm">
          Jenis kelamin
          <select className="input mt-1" {...register('jenisKelamin')}>
            <option value="LAKI_LAKI">Laki-laki</option>
            <option value="PEREMPUAN">Perempuan</option>
          </select>
        </label>
        <label className="text-sm">
          No. telepon
          <input className="input mt-1" {...register('noTelp')} />
        </label>
        <label className="text-sm md:col-span-2">
          Alamat
          <textarea className="input mt-1" {...register('alamat')} />
        </label>
        <label className="text-sm">
          Email
          <input className="input mt-1" {...register('email')} />
        </label>
        <label className="text-sm">
          Kloter
          <input className="input mt-1" {...register('kloter')} />
        </label>
        <label className="text-sm">
          Skema bayar
          <select className="input mt-1" {...register('tipeSkema')}>
            <option value="NORMAL">Normal</option>
            <option value="UMROH_DULU_BAYAR_NANTI">Umroh dulu bayar nanti</option>
          </select>
        </label>
        {tipeSkema === 'UMROH_DULU_BAYAR_NANTI' ? (
          <label className="text-sm">
            Deposit minimal
            <input type="number" className="input mt-1 font-mono" {...register('depositMinimal')} />
            {errors.depositMinimal ? <span className="text-xs text-danger">{errors.depositMinimal.message}</span> : null}
          </label>
        ) : null}
        {save.isError ? <p className="text-xs text-danger md:col-span-2">Gagal menyimpan.</p> : null}
        <button type="submit" disabled={isSubmitting} className="cta-pill md:col-span-2">
          Simpan
        </button>
      </form>
    </div>
  );
}
