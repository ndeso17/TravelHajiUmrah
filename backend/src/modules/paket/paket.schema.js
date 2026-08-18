import { z } from 'zod';

const paketFields = {
  nama: z.string().min(1, 'Nama paket wajib diisi'),
  tipe: z.enum(['HAJI', 'UMROH'], { message: 'Tipe paket harus HAJI atau UMROH' }),
  harga: z.coerce.number('Harga harus angka').positive('Harga harus lebih dari 0'),
  kuota: z.coerce
    .number('Kuota harus angka')
    .int('Kuota harus bilangan bulat')
    .positive('Kuota harus lebih dari 0'),
  tanggalBuka: z.coerce.date('Tanggal buka tidak valid'),
  tanggalTutup: z.coerce.date('Tanggal tutup tidak valid'),
  itinerary: z.string().optional().nullable(),
  fasilitas: z.array(z.string()).default([]),
  isAktif: z.boolean().optional().default(true),
};

export const createPaketSchema = z.object(paketFields).refine((data) => data.tanggalTutup > data.tanggalBuka, {
  message: 'Tanggal tutup harus setelah tanggal buka',
  path: ['tanggalTutup'],
});

export const updatePaketSchema = z
  .object(paketFields)
  .partial()
  .refine((data) => {
    if (data.tanggalBuka && data.tanggalTutup) return data.tanggalTutup > data.tanggalBuka;
    return true;
  }, {
    message: 'Tanggal tutup harus setelah tanggal buka',
    path: ['tanggalTutup'],
  });