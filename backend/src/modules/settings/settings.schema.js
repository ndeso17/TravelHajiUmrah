import { z } from 'zod';

export const updateQrisSchema = z.object({
  qrisDanaString: z.string().min(1, 'qrisDanaString wajib diisi'),
  qrisGopayString: z.string().min(1, 'qrisGopayString wajib diisi'),
  qrisDefaultProvider: z.enum(['DANA', 'GOPAY']).default('DANA'),
  rekeningBank: z.string().max(100).optional(),
  namaRekening: z.string().max(100).optional(),
  namaBank: z.string().max(100).optional(),
});