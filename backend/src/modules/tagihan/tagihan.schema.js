import { z } from 'zod';

export const generateTagihanSchema = z
  .object({
    jamaahId: z.string().min(1, 'Jamaah wajib diisi'),
    totalHarga: z.coerce.number('Total harga harus angka').positive('Total harga harus lebih dari 0'),
    jumlahCicilan: z.coerce
      .number('Jumlah cicilan harus angka')
      .int('Jumlah cicilan harus bilangan bulat')
      .min(1, 'Minimal 1 cicilan')
      .max(24, 'Maksimal 24 cicilan'),
    deadlines: z.array(z.coerce.date('Deadline tidak valid')).optional().default([]),
    depositMinimal: z.coerce.number().positive('Deposit minimal harus positif').optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.depositMinimal != null && data.depositMinimal > data.totalHarga) {
      ctx.addIssue({
        code: 'custom',
        path: ['depositMinimal'],
        message: 'depositMinimal tidak boleh melebihi totalHarga',
      });
    }
    if (data.deadlines.length > data.jumlahCicilan) {
      ctx.addIssue({
        code: 'custom',
        path: ['deadlines'],
        message: 'Jumlah deadlines tidak boleh melebihi jumlahCicilan',
      });
    }
  });