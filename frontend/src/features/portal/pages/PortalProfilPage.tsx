import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { fetchMe, updateMe } from '../../../api/publik';
import { LoadingSkeleton } from '../../../components/shared/LoadingSkeleton';
import { queryKeys } from '../../../lib/queryKeys';

const schema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  namaAyah: z.string().optional().or(z.literal('')),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
  statusPerkawinan: z.string().optional().or(z.literal('')),
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  noTelp: z.string().min(8, 'Nomor telepon minimal 8 digit'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export function PortalProfilPage() {
  const me = useQuery({ queryKey: queryKeys.publik.me, queryFn: fetchMe });
  const queryClient = useQueryClient();

  const defaults = useMemo<FormValues>(() => {
    const jamaah = me.data;
    return {
      namaLengkap: jamaah?.namaLengkap ?? '',
      namaAyah: jamaah?.namaAyah ?? '',
      tempatLahir: jamaah?.tempatLahir ?? '',
      tanggalLahir: jamaah?.tanggalLahir ? jamaah.tanggalLahir.slice(0, 10) : '',
      jenisKelamin: jamaah?.jenisKelamin ?? 'LAKI_LAKI',
      statusPerkawinan: jamaah?.statusPerkawinan ?? '',
      alamat: jamaah?.alamat ?? '',
      noTelp: jamaah?.noTelp ?? '',
      email: jamaah?.email ?? '',
    };
  }, [me.data]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), values: defaults });

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      updateMe({
        namaLengkap: values.namaLengkap,
        namaAyah: values.namaAyah || null,
        tempatLahir: values.tempatLahir,
        tanggalLahir: values.tanggalLahir,
        jenisKelamin: values.jenisKelamin,
        statusPerkawinan: values.statusPerkawinan || null,
        alamat: values.alamat,
        noTelp: values.noTelp,
        email: values.email || null,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.publik.me });
    },
  });

  if (me.isLoading) return <LoadingSkeleton variant="form" rows={6} />;
  if (me.isError || !me.data) return <p className="text-sm text-danger">Data jamaah tidak ditemukan.</p>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-heading text-xl font-bold text-ink">Profil</h1>
        <p className="text-sm text-ink-muted">Perbarui data diri Anda. Perubahan akan diverifikasi tim kami.</p>
      </div>
      <form
        onSubmit={handleSubmit((values) => save.mutate(values))}
        className="max-w-xl space-y-4 rounded-lg bg-surface p-6"
      >
        <Field label="Nama lengkap" error={errors.namaLengkap?.message}>
          <input className="input" {...register('namaLengkap')} />
        </Field>
        <Field label="Nama ayah" error={errors.namaAyah?.message}>
          <input className="input" {...register('namaAyah')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tempat lahir" error={errors.tempatLahir?.message}>
            <input className="input" {...register('tempatLahir')} />
          </Field>
          <Field label="Tanggal lahir" error={errors.tanggalLahir?.message}>
            <input className="input" type="date" {...register('tanggalLahir')} />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenis kelamin" error={errors.jenisKelamin?.message}>
            <select className="input" {...register('jenisKelamin')}>
              <option value="LAKI_LAKI">Laki-laki</option>
              <option value="PEREMPUAN">Perempuan</option>
            </select>
          </Field>
          <Field label="Status perkawinan" error={errors.statusPerkawinan?.message}>
            <input className="input" {...register('statusPerkawinan')} />
          </Field>
        </div>
        <Field label="Alamat" error={errors.alamat?.message}>
          <textarea className="input min-h-24" {...register('alamat')} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="No. telepon" error={errors.noTelp?.message}>
            <input className="input" {...register('noTelp')} />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input className="input" type="email" {...register('email')} />
          </Field>
        </div>
        {save.isSuccess ? <p className="text-xs text-success">Profil berhasil diperbarui.</p> : null}
        {save.isError ? <p className="text-xs text-danger">Gagal menyimpan profil. Coba lagi nanti.</p> : null}
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
