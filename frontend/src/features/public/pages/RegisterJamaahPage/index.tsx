import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { fetchLanding, registerPublicJamaah } from '../../../../api/publik';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../../../lib/cn';
import { queryKeys } from '../../../../lib/queryKeys';

const step1 = z.object({
  paketId: z.string().min(1, 'Paket wajib dipilih'),
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN']),
});

const step2 = z.object({
  alamat: z.string().min(1, 'Alamat wajib diisi'),
  noTelp: z.string().min(8, 'Nomor telepon minimal 8 digit'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  namaAyah: z.string().optional().or(z.literal('')),
  statusPerkawinan: z.string().optional().or(z.literal('')),
  kloter: z.string().optional().or(z.literal('')),
  password: z.string().min(6, 'Password minimal 6 karakter').optional().or(z.literal('')),
});

const schema = step1.merge(step2).superRefine((values, ctx) => {
  if (values.password && !values.email) {
    ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email wajib diisi jika membuat akun' });
  }
});

type FormValues = z.infer<typeof schema>;

export function RegisterJamaahPage() {
  const { paketId } = useParams<{ paketId: string }>();
  const [step, setStep] = useState(1);
  const queryClient = useQueryClient();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { paketId: paketId ?? '', jenisKelamin: 'LAKI_LAKI' },
    mode: 'onBlur',
  });

  const { data } = useQuery({ queryKey: queryKeys.publik.landing, queryFn: fetchLanding });
  const paket = data?.paketAktif.find((item) => item.id === paketId);

  const mutation = useMutation({
    mutationFn: registerPublicJamaah,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.publik.landing });
      setDone(true);
    },
  });

  const next = async () => {
    if (step === 1) {
      const ok = await trigger(['paketId', 'namaLengkap', 'tempatLahir', 'tanggalLahir', 'jenisKelamin'] as const);
      if (ok) setStep(2);
    } else if (step === 2) {
      handleSubmit((values) => {
        mutation.mutate(values);
      })();
    }
  };

  if (!paketId || !paket) {
    return <p className="mx-auto max-w-3xl px-4 py-10">Paket pendaftaran tidak valid. Pilih paket terlebih dahulu.</p>;
  }

  if (done) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl bg-surface p-6">
          <h1 className="font-heading text-2xl font-bold text-ink">Pendaftaran berhasil dikirim</h1>
          <p className="mt-2 text-ink-muted">Tim kami akan menghubungi Anda untuk proses selanjutnya.</p>
          <Link to="/daftar" className="cta-pill mt-6 inline-block text-sm">
            Lihat paket lain
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <Link to={`/paket/${paket.id}`} className="text-ink-muted hover:text-ink">
          <ArrowLeft />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">Pendaftaran Jamaah</h1>
          <p className="text-sm text-ink-muted">{paket.nama}</p>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-ink-muted">
        <span className={cn('rounded-full px-3 py-1', step === 1 ? 'bg-primary text-white' : 'bg-surface-muted')}>1</span>
        <span>Data Diri</span>
        <ChevronRight />
        <span className={cn('rounded-full px-3 py-1', step === 2 ? 'bg-primary text-white' : 'bg-surface-muted')}>2</span>
        <span>Kontak & Detail</span>
      </div>

      <form onSubmit={(event) => event.preventDefault()} className="mt-8 grid gap-5 rounded-2xl bg-surface p-6">
        {step === 1 && (
          <div className="grid gap-4">
            <Field label="Nama Lengkap" error={errors.namaLengkap?.message}>
              <input className="input" {...register('namaLengkap')} />
            </Field>
            <Field label="Tempat Lahir" error={errors.tempatLahir?.message}>
              <input className="input" {...register('tempatLahir')} />
            </Field>
            <Field label="Tanggal Lahir" error={errors.tanggalLahir?.message}>
              <input className="input" type="date" {...register('tanggalLahir')} />
            </Field>
            <Field label="Jenis Kelamin" error={errors.jenisKelamin?.message}>
              <select className="input" {...register('jenisKelamin')}>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4">
            <Field label="Alamat" error={errors.alamat?.message}>
              <textarea className="input" {...register('alamat')} />
            </Field>
            <Field label="No. Telepon" error={errors.noTelp?.message}>
              <input className="input" {...register('noTelp')} />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <input className="input" {...register('email')} />
            </Field>
            <Field label="Buat akun portal (opsional)" error={errors.password?.message}>
              <input className="input" type="password" placeholder="Password minimal 6 karakter" {...register('password')} />
              <span className="text-xs text-ink-muted">
                Isi email + password untuk membuat akun login ke portal jamaah.
              </span>
            </Field>
            <Field label="Nama Ayah" error={errors.namaAyah?.message}>
              <input className="input" {...register('namaAyah')} />
            </Field>
            <Field label="Kloter (opsional)" error={errors.kloter?.message}>
              <input className="input" {...register('kloter')} />
            </Field>
          </div>
        )}

        <div className="flex items-center justify-between">
          {step === 2 ? (
            <button type="button" onClick={() => setStep(1)} className="text-sm text-ink-muted">
              Kembali
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={next}
            disabled={mutation.isPending}
            className="cta-pill text-sm disabled:opacity-60"
          >
            {step === 1 ? 'Lanjut' : mutation.isPending ? 'Mengirim...' : 'Kirim Pendaftaran'}
          </button>
        </div>

        {mutation.isError ? (
          <p className="text-sm text-danger">Pendaftaran gagal. Coba lagi nanti.</p>
        ) : null}
      </form>
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-semibold text-ink">{label}</span>
      {children}
      {error ? <span className="text-xs text-danger">{error}</span> : null}
    </label>
  );
}