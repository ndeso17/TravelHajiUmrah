import { z } from 'zod';

export const uploadDokumenSchema = z.object({
  jamaahId: z.string().min(1, 'jamaahId wajib diisi').optional(),
  tipe: z.enum(['PASPOR', 'VISA', 'FOTO', 'KTP', 'SERTIFIKAT']),
});

export const verifikasiDokumenSchema = z.object({
  action: z.enum(['VERIFIED', 'REJECTED']),
  catatan: z.string().max(500).optional(),
});

export const listDokumenQuerySchema = z.object({
  jamaahId: z.string().min(1).optional(),
  tipe: z.enum(['PASPOR', 'VISA', 'FOTO', 'KTP', 'SERTIFIKAT']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});