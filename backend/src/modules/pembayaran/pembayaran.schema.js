import { z } from 'zod';

export const createPembayaranSchema = z
  .object({
    jamaahId: z.string().min(1, 'Jamaah wajib diisi').optional(),
    tagihanId: z.string().optional().nullable(),
    jumlah: z.coerce.number('Jumlah harus angka').positive('Jumlah harus lebih dari 0'),
    metodeBayar: z.enum(['QRIS', 'TRANSFER', 'CASH'], { message: 'Metode bayar tidak valid' }),
    qrisProvider: z.enum(['DANA', 'GOPAY']).optional().nullable(),
    buktiBayar: z.string().optional().nullable(),
    tanggal: z.coerce.date().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.metodeBayar === 'QRIS' && !data.qrisProvider) {
      ctx.addIssue({ code: 'custom', path: ['qrisProvider'], message: 'qrisProvider wajib untuk metode QRIS' });
    }
    if ((data.metodeBayar === 'QRIS' || data.metodeBayar === 'TRANSFER') && !data.buktiBayar) {
      ctx.addIssue({ code: 'custom', path: ['buktiBayar'], message: 'buktiBayar wajib untuk metode QRIS/TRANSFER' });
    }
  });

// Upload bukti via multipart (jamaah portal) — file di-handle multer, di sini hanya metadata.
// jumlah opsional: jika kosong, service memakai jumlah dari tagihan.
export const uploadBuktiSchema = z
  .object({
    jamaahId: z.string().min(1, 'Jamaah wajib diisi').optional(),
    tagihanId: z.string().min(1, 'Tagihan wajib diisi'),
    jumlah: z.coerce.number().positive('Jumlah harus lebih dari 0').optional(),
    metodeBayar: z.enum(['QRIS', 'TRANSFER'], { message: 'Metode bayar tidak valid' }),
    qrisProvider: z.enum(['DANA', 'GOPAY']).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.metodeBayar === 'QRIS' && !data.qrisProvider) {
      ctx.addIssue({ code: 'custom', path: ['qrisProvider'], message: 'qrisProvider wajib untuk metode QRIS' });
    }
  });

export const verifikasiPembayaranSchema = z.object({
  action: z.enum(['terima', 'tolak'], { message: 'Action harus terima atau tolak' }),
  catatan: z.string().optional().nullable(),
});

export const cashPembayaranSchema = z.object({
  tagihanId: z.string().min(1, 'Tagihan wajib diisi'),
  jumlah: z.coerce.number('Jumlah harus angka').positive('Jumlah harus lebih dari 0'),
  tanggal: z.coerce.date().optional(),
  catatan: z.string().optional().nullable(),
});