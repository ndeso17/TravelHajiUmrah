import { z } from 'zod';

const jamaahFields = {
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
  tipeSkema: z.enum(['NORMAL', 'UMROH_DULU_BAYAR_NANTI']).default('NORMAL'),
  depositMinimal: z.coerce.number().positive('Deposit minimal harus positif').optional().nullable(),
  deadlinePelunasan: z.coerce.date().optional().nullable(),
};

function udbnRefine(ctx, data) {
  if (data.tipeSkema === 'UMROH_DULU_BAYAR_NANTI' && (data.depositMinimal === undefined || data.depositMinimal === null)) {
    ctx.addIssue({
      code: 'custom',
      path: ['depositMinimal'],
      message: 'depositMinimal wajib diisi untuk skema UMROH_DULU_BAYAR_NANTI',
    });
  }
}

export const createJamaahSchema = z.object(jamaahFields).superRefine((data, ctx) => udbnRefine(ctx, data));

export const updateJamaahSchema = z.object(jamaahFields).partial().superRefine((data, ctx) => udbnRefine(ctx, data));