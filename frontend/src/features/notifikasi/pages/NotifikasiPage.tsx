import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { broadcastNotifikasi } from '../../../api/notifikasi.api';
import { fetchPaketList } from '../../../api/paket.api';
import { PageHeader } from '../../../components/shared/PageHeader';
import { queryKeys } from '../../../lib/queryKeys';

const schema = z.object({
  tipe: z.enum(['WA', 'EMAIL']),
  pesan: z.string().min(1, 'Pesan wajib diisi').max(2000),
  paketId: z.string().optional(),
  kloter: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function NotifikasiPage() {
  const pakets = useQuery({
    queryKey: queryKeys.paket.list({ limit: 100 }),
    queryFn: () => fetchPaketList({ limit: 100 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipe: 'WA', pesan: '', paketId: '', kloter: '' },
  });

  const send = useMutation({
    mutationFn: (values: FormValues) =>
      broadcastNotifikasi({
        tipe: values.tipe,
        pesan: values.pesan,
        filter: values.paketId || values.kloter ? { paketId: values.paketId || undefined, kloter: values.kloter || undefined } : undefined,
      }),
  });

  return (
    <div>
      <PageHeader title="Notifikasi" breadcrumbs={[{ label: 'Admin' }, { label: 'Notifikasi' }]} />
      <form onSubmit={form.handleSubmit((values) => send.mutate(values))} className="max-w-2xl space-y-4 rounded-lg bg-surface p-6 shadow-sm">
        <label className="block text-sm">
          Tipe
          <select className="input mt-1" {...form.register('tipe')}>
            <option value="WA">WhatsApp</option>
            <option value="EMAIL">Email</option>
          </select>
        </label>
        <label className="block text-sm">
          Paket
          <select className="input mt-1" {...form.register('paketId')}>
            <option value="">Semua paket</option>
            {(pakets.data?.data ?? []).map((paket) => (
              <option key={paket.id} value={paket.id}>{paket.nama}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          Kloter
          <input className="input mt-1" placeholder="Contoh: JKG-01" {...form.register('kloter')} />
        </label>
        <label className="block text-sm">
          Pesan
          <textarea className="input mt-1 min-h-40" {...form.register('pesan')} />
          {form.formState.errors.pesan ? <span className="text-xs text-danger">{form.formState.errors.pesan.message}</span> : null}
        </label>
        <button type="submit" className="cta-pill" disabled={send.isPending}>Kirim Broadcast</button>
        {send.data ? <p className="text-sm text-success">Terkirim {send.data.terkirim}, gagal {send.data.gagal}.</p> : null}
        {send.isError ? <p className="text-sm text-danger">Gagal mengirim broadcast.</p> : null}
      </form>
    </div>
  );
}
