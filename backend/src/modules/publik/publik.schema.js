import { z } from 'zod';

export const publicJamaahSchema = z
  .object({
    paketId: z.string().min(1, 'Paket wajib dipilih'),
    kloter: z.string().optional().nullable(),
    namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi'),
    namaAyah: z.string().optional().nullable(),
    tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi'),
    tanggalLahir: z.coerce.date('Tanggal lahir tidak valid'),
    jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN'], { message: 'Jenis kelamin tidak valid' }),
    statusPerkawinan: z.string().optional().nullable(),
    alamat: z.string().min(1, 'Alamat wajib diisi'),
    noTelp: z.string().min(8, 'Nomor telepon minimal 8 digit'),
    email: z.string().email('Email tidak valid').optional().nullable(),
    password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && !data.email) {
      ctx.addIssue({ code: 'custom', path: ['email'], message: 'Email wajib diisi jika membuat akun' });
    }
  });

export const updateMeSchema = z.object({
  namaLengkap: z.string().min(1, 'Nama lengkap wajib diisi').optional(),
  namaAyah: z.string().optional().nullable(),
  tempatLahir: z.string().min(1, 'Tempat lahir wajib diisi').optional(),
  tanggalLahir: z.coerce.date('Tanggal lahir tidak valid').optional(),
  jenisKelamin: z.enum(['LAKI_LAKI', 'PEREMPUAN'], { message: 'Jenis kelamin tidak valid' }).optional(),
  statusPerkawinan: z.string().optional().nullable(),
  alamat: z.string().min(1, 'Alamat wajib diisi').optional(),
  noTelp: z.string().min(8, 'Nomor telepon minimal 8 digit').optional(),
  email: z.string().email('Email tidak valid').optional().nullable(),
});