import { z } from 'zod';

export const broadcastSchema = z.object({
  tipe: z.enum(['WA', 'EMAIL']),
  pesan: z.string().min(1).max(2000),
  filter: z
    .object({
      paketId: z.string().min(1).optional(),
      kloter: z.string().min(1).optional(),
    })
    .optional(),
});