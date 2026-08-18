import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { createUser, fetchUsers, updateUser } from '../../../api/users.api';
import type { Role, User } from '../../../api/types';
import { DataTable } from '../../../components/shared/DataTable';
import { PageHeader } from '../../../components/shared/PageHeader';
import { StatusBadge } from '../../../components/shared/StatusBadge';
import { formatTanggal } from '../../../lib/formatters';

const schema = z.object({
  name: z.string().min(1, 'Nama wajib'),
  email: z.string().email('Email tidak valid'),
  password: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'JAMAAH']),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function UserManagementPage() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | null>(null);
  const queryClient = useQueryClient();

  const users = useQuery({
    queryKey: ['users', 'list', { page }],
    queryFn: () => fetchUsers({ page, limit: 10 }),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      name: editing?.name ?? '',
      email: editing?.email ?? '',
      password: '',
      role: editing?.role ?? 'STAFF',
      isActive: editing?.isActive ?? true,
    },
  });

  const save = useMutation({
    mutationFn: (values: FormValues) => {
      if (editing) {
        return updateUser(editing.id, { ...values, password: values.password || undefined });
      }
      return createUser({ name: values.name, email: values.email, role: values.role, password: values.password || 'Admin123!' });
    },
    onSuccess: () => {
      setEditing(null);
      form.reset();
      void queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      { accessorKey: 'name', header: 'Nama' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'role', header: 'Role' },
      { accessorKey: 'isActive', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue() ? 'aktif' : 'batal'} /> },
      { accessorKey: 'createdAt', header: 'Dibuat', cell: ({ getValue }) => formatTanggal(String(getValue())) },
      { id: 'aksi', header: 'Aksi', cell: ({ row }) => <button type="button" className="text-primary hover:underline" onClick={() => setEditing(row.original)}>Edit</button> },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Manajemen User" breadcrumbs={[{ label: 'Admin' }, { label: 'Users' }]} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {users.isError ? <p className="mb-3 text-sm text-danger">Gagal memuat user.</p> : null}
          <DataTable columns={columns} data={users.data?.data ?? []} meta={users.data?.meta} isLoading={users.isLoading} onPageChange={setPage} emptyTitle="Belum ada user" />
        </div>
        <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="space-y-3 rounded-lg bg-surface p-5 shadow-sm">
          <h2 className="font-heading font-semibold">{editing ? 'Edit user' : 'User baru'}</h2>
          <label className="block text-sm">Nama<input className="input mt-1" {...form.register('name')} /></label>
          <label className="block text-sm">Email<input className="input mt-1" {...form.register('email')} /></label>
          <label className="block text-sm">Password<input className="input mt-1" type="password" placeholder={editing ? 'Kosongkan jika tidak diganti' : 'Default Admin123!'} {...form.register('password')} /></label>
          <label className="block text-sm">Role
            <select className="input mt-1" {...form.register('role')}>
              {(['SUPER_ADMIN', 'ADMIN', 'STAFF', 'JAMAAH'] as readonly Role[]).map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register('isActive')} /> Aktif</label>
          <div className="flex gap-2">
            <button type="submit" className="cta-pill text-sm" disabled={save.isPending}>Simpan</button>
            {editing ? <button type="button" className="rounded-full px-4 py-2 text-sm" onClick={() => setEditing(null)}>Batal</button> : null}
          </div>
          {save.isError ? <p className="text-xs text-danger">Gagal menyimpan user.</p> : null}
        </form>
      </div>
    </div>
  );
}
